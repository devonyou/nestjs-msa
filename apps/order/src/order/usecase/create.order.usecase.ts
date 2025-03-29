import { Inject, Injectable } from '@nestjs/common';
import { OrderEntity } from '../domain/order.entity';
import { OrderOutputPort } from '../port/output/order.output.port';
import { PaymentOutputPort } from '../port/output/payment.output.port';
import { ProductOutputPort } from '../port/output/product.output.port';
import { UserOutputPort } from '../port/output/user.output.port';
import { CreateOrderDto } from './dto/create.order.dto';

@Injectable()
export class CreateOrderUsecase {
    constructor(
        @Inject('UserOutputPort')
        private readonly userOutputPort: UserOutputPort,
        @Inject('ProductOutputPort')
        private readonly productOutputPort: ProductOutputPort,
        @Inject('OrderOutputPort')
        private readonly orderOutputPort: OrderOutputPort,
        @Inject('PaymentOutputPort')
        private readonly paymentOutputPort: PaymentOutputPort,
    ) {}

    async execute(dto: CreateOrderDto) {
        // 1. User 조회 > User
        const user = await this.userOutputPort.getUserById(dto.userId);

        // 2. Products 조회 > Product
        const products = await this.productOutputPort.getProductsByIds(
            dto.productIds,
        );

        // 3. 주문 생성 > Order
        const order = new OrderEntity({
            customer: user,
            product: products,
            deliveryAddress: dto.address,
        });

        // 4. 총액 계산 > Order
        order.calulateTotalAmount();

        // 5. 주문 DB 저장 > Order
        const result = await this.orderOutputPort.createOrder(order);

        // 6. 주문 ID 저장 > Order
        order.setId(result.id);

        try {
            // 7. 결제 진행 > Payment
            const paymentResult = await this.paymentOutputPort.processPayment(
                order,
                dto.payment,
            );

            // 8. 결제 정보 Order에 저장 > Order
            order.setPayment(paymentResult.payment);
            await this.orderOutputPort.updateOrder(order);
        } catch (err) {
            // 9. 결제 실패시 프로세스 취소
            order.cancelOrder();
            await this.orderOutputPort.updateOrder(order);
        }

        return order;
    }
}
