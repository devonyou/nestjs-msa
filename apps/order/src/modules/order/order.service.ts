import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrderEntity } from '../../entitites/order.entity';
import { OrderMicroService, RedisService } from '@app/common';
import { ClientProxy, RmqContext, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { OrderProductService } from './order.product.service';

@Injectable()
export class OrderService implements OnModuleInit {
    constructor(
        @InjectDataSource() private readonly datasource: DataSource,

        @Inject('ORDER_RMQ') private readonly orderRmqClient: ClientProxy,
        private readonly redisService: RedisService,
        private readonly orderProductService: OrderProductService,
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

        // redis lock
        const lockKey = `lock:order:${userId}`;
        const lockValue = userId.toString();
        const lockTtl = 10;
        const isLocked = await this.redisService.acquireLock(lockKey, lockValue, lockTtl);

        if (!isLocked) {
            await this.redisService.releaseLock(lockKey, lockValue);
            channel.ack(message);
            return null;
        }

        // qr
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

            await this.redisService.releaseLock(lockKey, lockValue);
            channel.ack(message);
        }
    }

    /**
     * 주문 완료
     * @param request OrderMicroService.CompleteOrderRequest
     * @returns OrderEntity
     */
    async completeOrder(request: OrderMicroService.CompleteOrderRequest): Promise<OrderEntity> {
        const { userId, orderId, paymentId } = request;

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

            // 주문 업데이트(성공, 결제 아이디)
            await qr.manager.getRepository(OrderEntity).update(order.id, {
                status: OrderMicroService.OrderStatus.PAYMENT_SUCCESS,
                paymentId,
            });

            // 재고 차감
            await this.orderProductService.confirmStockReservation({ orderId: order.id });

            const updatedOrder = await qr.manager.getRepository(OrderEntity).findOne({
                where: { id: orderId, userId },
            });

            await qr.commitTransaction();

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
                    paymentId,
                },
            );

            // 재고 예약 복구
            await this.orderProductService.restoreStockReservation({ orderId: orderId });

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
