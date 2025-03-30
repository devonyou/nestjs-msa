import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create.order.dto';
import { PaymentOutputPort } from '../port/output/payment.output.port';
import { ProductOutputPort } from '../port/output/product.output.port';
import { OrderOutputPort } from '../port/output/order.output.port';
import { CustomerOutputPort } from '../port/output/customer.output.port';
import { OrderDomain } from '../domain/order.domain';

@Injectable()
export class CreateOrderUsecase {
    constructor(
        @Inject('OrderOutputPort')
        private readonly orderOutputPort: OrderOutputPort,
        @Inject('ProductOutputPort')
        private readonly productOutputPort: ProductOutputPort,
        @Inject('CustomerOutputPort')
        private readonly customerOutputPort: CustomerOutputPort,
        @Inject('PaymentOutputPort')
        private readonly paymentOutputPort: PaymentOutputPort,
    ) {}

    async execute(dto: CreateOrderDto): Promise<OrderDomain> {
        const customer = await this.customerOutputPort.findCustomerById(
            dto.userId,
        );

        const products = await this.productOutputPort.findManyProductsByIds(
            dto.productIds,
        );

        const orderDomain = new OrderDomain({
            customer: customer,
            deliveryAddress: dto.address,
            products: products,
        });

        orderDomain.calcAmount();

        const order = await this.orderOutputPort.createOrder(orderDomain);
        orderDomain.setId(order.id);

        try {
            const payment = await this.paymentOutputPort.processPayment(
                orderDomain,
                dto.payment,
            );

            orderDomain.setPayment(payment);
            orderDomain.processPayment();
            await this.orderOutputPort.updateOrder(orderDomain);
        } catch (err) {
            orderDomain.cancelPayment();
            await this.orderOutputPort.updateOrder(orderDomain);
        }

        return orderDomain;
    }
}
