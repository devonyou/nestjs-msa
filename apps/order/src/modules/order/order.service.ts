import { CreateOrderRequest } from '@app/common/grpc/proto/order';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../entitites/order.entity';
import { OrderItemEntity } from '../../entitites/order.item.entity';
import { OrderDeliveryEntity } from '../../entitites/order.delivery.entity';
import { Transactional } from 'typeorm-transactional';
import { createGrpcMetadata, OrderMicroService, ProductMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
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
    ) {}

    onModuleInit() {
        this.productService = this.productMicroService.getService<ProductMicroService.ProductServiceClient>(
            ProductMicroService.PRODUCT_SERVICE_NAME,
        );
    }

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

    async getOrderById(id: string): Promise<OrderEntity> {
        return this.orderRepository.findOne({ where: { id }, relations: ['items', 'delivery'] });
    }

    async getOrderByIdAndUser(request: OrderMicroService.GetOrderByIdAndUserRequest): Promise<OrderEntity> {
        return this.orderRepository.findOne({
            where: { id: request.orderId, userId: request.userId },
            relations: ['items', 'delivery'],
        });
    }

    async getOrdersByUserId(userId: number): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { userId }, relations: ['items', 'delivery'] });
    }

    @Transactional()
    async createOrder(request: CreateOrderRequest): Promise<OrderEntity> {
        const { userId, items, delivery } = request;

        if (!items) {
            throw new GrpcNotFoundException('주문 상품이 없습니다');
        }

        const { products, total } = await this.getProductsByIds(items.map(o => o.productId));
        if (total !== items.length) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }

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

        return await this.orderRepository.save(order);
    }

    async updateOrderStatus(request: OrderMicroService.UpdateOrderStatusRequest) {
        const order = await this.getOrderById(request.orderId);
        if (!order) {
            throw new GrpcNotFoundException('주문을 찾을 수 없습니다');
        }

        order.status = request.status;
        return await this.orderRepository.save(order);
    }
}
