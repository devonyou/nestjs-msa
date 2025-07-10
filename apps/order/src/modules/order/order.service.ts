import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../entitites/order.entity';
import { OrderItemEntity } from '../../entitites/order.item.entity';
import { OrderDeliveryEntity } from '../../entitites/order.delivery.entity';
import { Transactional } from 'typeorm-transactional';
import { createGrpcMetadata, OrderMicroService, ProductMicroService, RedisService } from '@app/common';
import { ClientGrpc, ClientProxy, RmqContext, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class OrderService implements OnModuleInit {
    private productService: ProductMicroService.ProductServiceClient;

    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(OrderItemEntity)
        private readonly orderItemRepository: Repository<OrderItemEntity>,
        @InjectRepository(OrderDeliveryEntity)
        private readonly orderDeliveryRepository: Repository<OrderDeliveryEntity>,

        @Inject(ProductMicroService.PRODUCT_SERVICE_NAME)
        private readonly productMicroService: ClientGrpc,

        @Inject('ORDER_RMQ') private readonly orderRmqClient: ClientProxy,

        private readonly redisService: RedisService,
    ) {}

    onModuleInit() {
        this.productService = this.productMicroService.getService<ProductMicroService.ProductServiceClient>(
            ProductMicroService.PRODUCT_SERVICE_NAME,
        );

        this.orderRmqClient.connect();
    }

    /**
     * 주문 조회
     * @param id 주문 ID
     * @returns OrderEntity
     */
    async getOrderById(id: string): Promise<OrderEntity> {
        return this.orderRepository.findOne({ where: { id }, relations: ['items', 'delivery'] });
    }

    /**
     * 주문 조회
     * @param request OrderMicroService.GetOrderByIdAndUserRequest
     * @returns OrderEntity
     */
    async getOrderByIdAndUser(request: OrderMicroService.GetOrderByIdAndUserRequest): Promise<OrderEntity> {
        return this.orderRepository.findOne({
            where: { id: request.orderId, userId: request.userId },
            relations: ['items', 'delivery'],
        });
    }

    /**
     * 사용자 주문 조회
     * @param userId 사용자 ID
     * @returns OrderEntity[]
     */
    async getOrdersByUserId(userId: number): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { userId }, relations: ['items', 'delivery'] });
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
    @Transactional()
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

        try {
            // throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
            // 상품id 검증 및 조회
            const { products, total } = await this.getProductsByIds(items.map(o => o.productId));
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
            const order = this.orderRepository.create({
                userId,
                amount,
                status: OrderMicroService.OrderStatus.CREATED,
                delivery: {
                    postCode: delivery.postCode,
                    street: delivery.street,
                },
                items: orderItems,
            });

            const savedOrder = await this.orderRepository.save(order);

            // 재고 예약
            await this.createStockReservation({
                reservations: orderItems.map(item => ({
                    productId: item.productId,
                    reservedQty: item.quantity,
                })),
                orderId: order.id,
            });

            return savedOrder;
        } catch (error) {
            if (error instanceof RpcException) {
                const message = JSON.parse(error.message)?.error;
                throw new GrpcNotFoundException(message);
            }
            throw new GrpcNotFoundException('주문이 불가능 합니다.');
        } finally {
            await this.redisService.releaseLock(lockKey, lockValue);
            channel.ack(message);
        }
    }

    /**
     * 주문 상태 업데이트
     * @param request OrderMicroService.UpdateOrderStatusRequest
     * @returns OrderEntity
     */
    async updateOrderStatus(request: OrderMicroService.UpdateOrderStatusRequest) {
        const order = await this.getOrderById(request.orderId);
        if (!order) {
            throw new GrpcNotFoundException('주문을 찾을 수 없습니다');
        }

        order.status = request.status;
        return await this.orderRepository.save(order);
    }

    /**
     * 상품 조회
     * @param ids 상품 ID 배열
     * @returns ProductMicroService.ProductListResponse
     */
    async getProductsByIds(ids: number[]): Promise<ProductMicroService.ProductListResponse> {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.getProductsByIds.name);
            const stream = this.productService.getProductsByIds({ ids }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }
    }

    /**
     * 재고 예약
     * @param request ProductMicroService.CreateStockReservationRequest
     * @returns ProductMicroService.StockReservationListResponse
     */
    async createStockReservation(request: ProductMicroService.CreateStockReservationRequest) {
        try {
            const metadata = createGrpcMetadata(OrderService.name, this.createStockReservation.name);
            const stream = this.productService.createStockReservation(request, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            const message = JSON.parse(error?.details)?.error;
            throw new GrpcNotFoundException(message || '재고 예약이 불가능 합니다.');
        }
    }
}
