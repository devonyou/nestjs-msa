import { PaymentMicroService } from '@app/common';
import { OrderEntity } from '../../../domain/order.entity';
import { PaymentDto } from '../../../usecase/dto/create.order.dto';
import { PaymentMethod } from '../../../domain/payment.entity';

export class PaymentResponseMapper {
    constructor(
        private readonly response: PaymentMicroService.CreatePaymentResponse,
    ) {}

    toDomain(order: OrderEntity, payment: PaymentDto): OrderEntity {
        order.setPayment({
            ...payment,
            paymentId: this.response.id,
            paymentMethod: this.parsePaymentMethod(payment.paymentMethod),
        });
        return order;
    }

    parsePaymentMethod(paymentMethod: string): PaymentMethod {
        switch (paymentMethod) {
            case 'CreditCard':
                return PaymentMethod.creditCard;
            case 'Kakao':
                return PaymentMethod.kakaoPay;
            default:
                throw new Error('알 수 없는 결제 방식입니다.');
        }
    }
}
