import { Inject, Injectable } from '@nestjs/common';
import { OrderOutputPort } from '../port/output/order.output.port';
import { OrderDomain } from '../domain/order.domain';
import { OrderDocument } from '../adapter/mongoose/document/order.document';

@Injectable()
export class StartDeliveryUsecase {
    constructor(
        @Inject('OrderOutputPort')
        private readonly orderOutputPort: OrderOutputPort,
    ) {}

    async execute(orderId: string): Promise<OrderDomain> {
        const order = await this.orderOutputPort.findOrderById(orderId);
        order.startDelivery();
        await this.orderOutputPort.updateOrder(order);
        return order;
    }
}
