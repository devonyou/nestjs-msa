import { Model } from 'mongoose';
import { OrderEntity } from '../../../domain/order.entity';
import { OrderOutputPort } from '../../../port/output/order.output.port';
import { InjectModel } from '@nestjs/mongoose';
import { OrderDocument } from '../entity/order.entity';
import { OrderDocumentMapper } from './mapper/order.document.mapper';

export class OrderRepository implements OrderOutputPort {
    constructor(
        @InjectModel(OrderDocument.name)
        private readonly orderRepository: Model<OrderDocument>,
    ) {}

    async createOrder(order: OrderEntity): Promise<OrderEntity> {
        const newOrder = await this.orderRepository.create(order);
        return new OrderDocumentMapper(newOrder).toDomain();
    }

    async updateOrder(order: OrderEntity): Promise<OrderEntity> {
        const { id, ...restOrder } = order;
        const result = await this.orderRepository.findByIdAndUpdate(
            id,
            restOrder,
        );
        return new OrderDocumentMapper(result).toDomain();
    }

    async getOrderById(orderId: string): Promise<OrderEntity> {
        const order = await this.orderRepository.findById(orderId);
        return new OrderDocumentMapper(order).toDomain();
    }
}
