import { OrderMicroService } from '@app/common';
import { CreateOrderDto } from '../dto/create.order.dto';
import { PaymentMethod } from '../domain/payment.domain';

export class CreateOrderRequestMapper {
    constructor(
        private readonly request: OrderMicroService.CreateOrderRequest,
    ) {}

    toCreateOrderDto(): CreateOrderDto {
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

    private parsePaymentMethod(paymentMethod: string): PaymentMethod {
        const paymentMethods = Object.values(PaymentMethod);
        if (!paymentMethods.includes(paymentMethod as PaymentMethod)) {
            throw new Error('알 수 없는 결제 방식입니다.');
        }
        return paymentMethod as PaymentMethod;
    }
}
