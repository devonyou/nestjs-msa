import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrderEntity } from '../../entitites/order.entity';
import { OrderMicroService, RedisLockService } from '@app/common';
import { ClientProxy, RmqContext, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { OrderProductService } from './order.product.service';
import { OrderPaymentService } from './order.payment.service';
import { OrderNotificationService } from './order.notification.service';

@Injectable()
export class OrderService implements OnModuleInit {
    constructor(
        @InjectDataSource() private readonly datasource: DataSource,

        @Inject('ORDER_RMQ') private readonly orderRmqClient: ClientProxy,

        private readonly redisLockService: RedisLockService,

        private readonly orderProductService: OrderProductService,
        private readonly orderPaymentService: OrderPaymentService,
        private readonly orderNotificationService: OrderNotificationService,
    ) {}

    onModuleInit() {
        this.orderRmqClient.connect();
    }

    /**
     * 주문 조회
     * @param request OrderMicroService.GetOrderByIdAndUserRequest
     * @returns OrderEntity
     */
    async getOrderByIdAndUser(request: OrderMicroService.GetOrderByIdAndUserRequest): Promise<OrderEntity> {
        return this.datasource.getRepository(OrderEntity).findOne({
            where: {
                id: request.orderId,
                userId: request.userId,
            },
            relations: ['items', 'delivery'],
        });
    }

    /**
     * 사용자 주문 조회
     * @param userId 사용자 ID
     * @returns OrderEntity[]
     */
    async getOrdersByUserId(userId: number): Promise<OrderEntity[]> {
        return this.datasource.getRepository(OrderEntity).find({ where: { userId }, relations: ['items', 'delivery'] });
    }

    /**
     * 주문 초기화
     * @param request OrderMicroService.InitiateOrderRequest
     * @returns OrderEntity
     */
    async initiateOrder(request: OrderMicroService.InitiateOrderRequest): Promise<OrderEntity> {
        try {
            const stream = this.orderRmqClient.send<OrderEntity>('order.initiate', request);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.message)?.error;
            throw new GrpcNotFoundException(message || '주문을 찾을 수 없습니다');
        }
    }

    /**
     * 주문 초기화 프로세스
     * @param request OrderMicroService.InitiateOrderRequest
     * @param context RmqContext
     * @returns OrderEntity
     */
    async processInitiateOrder(request: OrderMicroService.InitiateOrderRequest, context: RmqContext) {
        const { userId, items, delivery } = request;

        // rmq
        const channel = context.getChannelRef();
        const message = context.getMessage();

        // redis red lock
        const lockKey = `lock:order:${userId}`;
        const lockTtl = 10;
        const lock = await this.redisLockService.acquireLock(lockKey, lockTtl);

        if (!lock) {
            await this.redisLockService.releaseLock(lock);
            channel.ack(message);
            return null;
        }

        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            // 상품id 검증 및 조회
            const { products, total } = await this.orderProductService.getProductsByIds(items.map(o => o.productId));
            if (total !== items.length) {
                throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
            }

            // 총액 계산
            const amount = products.reduce((acc, product) => {
                return acc + items.find(o => o.productId === product.id).quantity * product.price;
            }, 0);

            const productPriceMap = new Map(products.map(p => [p.id, p.price]));
            const productNameMap = new Map(products.map(p => [p.id, p.name]));

            const orderItems = items.map(item => ({
                price: productPriceMap.get(item.productId),
                productId: item.productId,
                quantity: item.quantity,
                productName: productNameMap.get(item.productId),
            }));

            // 주문 생성
            const order = qr.manager.getRepository(OrderEntity).create({
                userId,
                amount,
                delivery: {
                    postCode: delivery.postCode,
                    street: delivery.street,
                },
                status: OrderMicroService.OrderStatus.PAYMENT_PENDING,
                items: orderItems,
            });

            const savedOrder = await qr.manager.getRepository(OrderEntity).save(order);

            // 재고 예약
            await this.orderProductService.createStockReservation({
                reservations: orderItems.map(item => ({
                    productId: item.productId,
                    reservedQty: item.quantity,
                })),
                orderId: savedOrder.id,
            });

            // 결제 생성
            const payment = await this.orderPaymentService.createPayment({
                userId,
                orderId: savedOrder.id,
                amount: savedOrder.amount,
                provider: 'toss',
            });

            // 주문 업데이트(결제 아이디)
            await qr.manager.getRepository(OrderEntity).update(savedOrder.id, {
                paymentId: payment.id,
            });

            await qr.commitTransaction();

            return savedOrder;
        } catch (error) {
            await qr.rollbackTransaction();

            if (error instanceof RpcException) {
                const message = JSON.parse(error.message)?.error;
                throw new GrpcNotFoundException(message);
            }
            throw new GrpcNotFoundException('주문이 불가능 합니다.');
        } finally {
            await qr.release();

            await this.redisLockService.releaseLock(lock);
            channel.ack(message);
        }
    }

    /**
     * 주문 완료
     * @param request OrderMicroService.CompleteOrderRequest
     * @returns OrderEntity
     */
    async completeOrder(request: OrderMicroService.CompleteOrderRequest): Promise<OrderEntity> {
        const { userId, userEmail, orderId, providerPaymentId } = request;
        let paymentId: number;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const order = await qr.manager.getRepository(OrderEntity).findOne({
                where: {
                    id: orderId,
                    userId,
                    status: OrderMicroService.OrderStatus.PAYMENT_PENDING,
                },
            });

            if (!order) {
                throw new GrpcNotFoundException('주문을 찾을 수 없습니다');
            }

            // 주문 상태 업데이트(성공)
            await qr.manager.getRepository(OrderEntity).update(order.id, {
                status: OrderMicroService.OrderStatus.PAYMENT_SUCCESS,
            });

            // 재고 차감
            await this.orderProductService.confirmStockReservation({ orderId: order.id });

            const updatedOrder = await qr.manager.getRepository(OrderEntity).findOne({
                where: { id: orderId, userId },
                relations: ['items'],
            });

            // 결제 상태 업데이트(성공)
            await this.orderPaymentService
                .confirmPayment({
                    paymentId: order.paymentId,
                    providerPaymentId: providerPaymentId,
                })
                .then(res => {
                    paymentId = res.id;
                    return res;
                });

            await qr.commitTransaction();

            // 메일 전송
            await this.orderNotificationService.sendOrderConfirmationEmail({
                to: userEmail,
                userName: updatedOrder.userId.toString(),
                orderId: updatedOrder.id,
                orderDate: updatedOrder.createdAt.toISOString(),
                totalAmount: updatedOrder.amount,
                items: updatedOrder.items?.map(item => ({
                    name: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });

            return updatedOrder;
        } catch (error) {
            await qr.rollbackTransaction();

            // 주문 상태 업데이트 (실패)
            await this.datasource.getRepository(OrderEntity).update(
                {
                    id: orderId,
                    userId,
                    status: OrderMicroService.OrderStatus.PAYMENT_PENDING,
                },
                {
                    status: OrderMicroService.OrderStatus.PAYMENT_FAILED,
                },
            );

            // 재고 예약 복구
            await this.orderProductService.restoreStockReservation({ orderId: orderId });

            // 결제 상태 업데이트 (취소)
            if (paymentId) {
                await this.orderPaymentService.cancelPayment({
                    paymentId: paymentId,
                });
            }

            if (error instanceof RpcException) {
                const message = JSON.parse(error.message)?.error;
                throw new GrpcNotFoundException(message ?? '주문이 불가능 합니다.');
            }

            throw new GrpcNotFoundException('주문이 불가능 합니다.');
        } finally {
            await qr.release();
        }
    }

    /**
     * 주문 취소
     * @param request OrderMicroService.CancelOrderRequest
     * @returns OrderEntity
     */
    async cancelOrder(request: OrderMicroService.CancelOrderRequest): Promise<OrderEntity> {
        const { userId, orderId } = request;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const order = await qr.manager.getRepository(OrderEntity).findOne({
                where: { id: orderId, userId },
            });

            if (!order) {
                throw new GrpcNotFoundException('주문을 찾을 수 없습니다');
            }

            if (order.status !== OrderMicroService.OrderStatus.PAYMENT_SUCCESS) {
                throw new GrpcNotFoundException('주문이 취소 가능한 상태가 아닙니다');
            }

            await qr.manager.getRepository(OrderEntity).update(order.id, {
                status: OrderMicroService.OrderStatus.PAYMENT_CANCELED,
            });

            await this.orderProductService.restoreStockReservation({ orderId: order.id });

            await this.orderPaymentService.cancelPayment({
                paymentId: order.paymentId,
            });

            await qr.commitTransaction();

            const updatedOrder = await qr.manager.getRepository(OrderEntity).findOne({ where: { id: order.id } });

            return updatedOrder;
        } catch (error) {
            await qr.rollbackTransaction();

            if (error instanceof RpcException) {
                const message = JSON.parse(error.message)?.error;
                throw new GrpcNotFoundException(message ?? '주문이 취소 가능한 상태가 아닙니다.');
            }

            throw new GrpcNotFoundException('주문이 취소 가능한 상태가 아닙니다.');
        } finally {
            await qr.release();
        }
    }

    /**
     * 주문 상태 업데이트
     * @param request OrderMicroService.UpdateOrderStatusRequest
     * @returns OrderEntity
     */
    async updateOrderStatusById(dto: { orderId: string; status: OrderMicroService.OrderStatus }): Promise<OrderEntity> {
        const order = await this.datasource.getRepository(OrderEntity).findOne({ where: { id: dto.orderId } });
        if (!order) {
            throw new GrpcNotFoundException('주문을 찾을 수 없습니다');
        }

        order.status = dto.status;
        return await this.datasource.getRepository(OrderEntity).save(order);
    }
}
