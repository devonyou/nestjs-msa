import { InjectModel } from '@nestjs/mongoose';
import { OrderDomain } from '../../domain/order.domain';
import { OrderOutputPort } from '../../port/output/order.output.port';
import { OrderDocument } from './document/order.document';
import { Model } from 'mongoose';
import { OrderDocumentMapper } from '../../mapper/order.document.mapper';

export class OrderRepository implements OrderOutputPort {
    constructor(
        @InjectModel(OrderDocument.name)
        private readonly orderRepository: Model<OrderDocument>,
    ) {}

    async createOrder(orderDomain: OrderDomain): Promise<OrderDomain> {
        const order = await this.orderRepository.create(orderDomain);
        const mapper = new OrderDocumentMapper(order);
        return mapper.toDomain();
    }

    async updateOrder(orderDomain: OrderDomain): Promise<OrderDomain> {
        const { id, ...rest } = orderDomain;
        const order = await this.orderRepository.findByIdAndUpdate(id, rest);
        const mapper = new OrderDocumentMapper(order);
        return mapper.toDomain();
    }

    async findOrderById(orderId: string): Promise<OrderDomain> {
        const order = await this.orderRepository.findById(orderId);
        const mapper = new OrderDocumentMapper(order);
        return mapper.toDomain();
    }
}
