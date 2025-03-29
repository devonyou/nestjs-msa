import { Inject, Injectable } from '@nestjs/common';
import { OrderOutputPort } from '../port/output/order.output.port';

@Injectable()
export class StartDeliveryUsecase {
    constructor(
        @Inject('OrderOutputPort')
        private readonly orderOutputPort: OrderOutputPort,
    ) {}

    async execute(orderId: string) {
        const order = await this.orderOutputPort.getOrderById(orderId);
        order.startDelivery();
        await this.orderOutputPort.updateOrder(order);
        return order;
    }
}
