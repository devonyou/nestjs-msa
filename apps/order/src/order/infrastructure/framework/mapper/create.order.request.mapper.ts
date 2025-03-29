import { OrderMicroService } from '@app/common';
import { CreateOrderDto } from '../../../usecase/dto/create.order.dto';
import { PaymentMethod } from '../../../domain/payment.entity';

export class CreateOrderRequestMapper {
    constructor(
        private readonly request: OrderMicroService.CreateOrderRequest,
    ) {}

    toDomain(): CreateOrderDto {
        return {
            userId: this.request.meta.user.sub,
            productIds: this.request.productIds,
            address: this.request.address,
            payment: {
                ...this.request.payment,
                paymentMethod: this.parsePaymentMethod(
                    this.request.payment.paymentMethod,
                ),
            },
        };
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
