import { Inject, Injectable } from '@nestjs/common';
import { OrderOutputPort } from '../port/output/order.output.port';

@Injectable()
export class CancelOrderUsecase {
    constructor(
        @Inject('OrderOutputPort')
        private readonly orderOutputPort: OrderOutputPort,
    ) {}

    async execute(orderId: string) {
        const order = await this.orderOutputPort.findOrderById(orderId);
        order.cancelPayment();
        await this.orderOutputPort.updateOrder(order);
    }
}
