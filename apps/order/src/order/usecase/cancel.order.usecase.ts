import { Inject } from '@nestjs/common';
import { OrderOutputPort } from '../port/output/order.output.port';

export class CancelOrderUsecase {
    constructor(
        @Inject('OrderOutputPort')
        private readonly orderOutputPort: OrderOutputPort,
    ) {}

    async execute(orderId: string) {
        const order = await this.orderOutputPort.getOrderById(orderId);
        order.cancelOrder();
        await this.orderOutputPort.updateOrder(order);
    }
}
