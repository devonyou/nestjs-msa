import { OrderMicroService, PaymentMicroService } from '@app/common';
import { OrderDomain } from '../domain/order.domain';
import { PaymentDto } from '../dto/create.order.dto';
import { PaymentDomain } from '../domain/payment.domain';

export class OrderDomainMapper {
    constructor(private readonly orderDomain: OrderDomain) {}

    toCreateOrderResponse(): OrderMicroService.CreateOrderResponse {
        return {
            ...this.orderDomain,
            product: this.orderDomain.products,
        };
    }

    toCreatePaymentRequest(
        payment: PaymentDto,
    ): PaymentMicroService.CreatePaymentRequest {
        return {
            orderId: this.orderDomain.id,
            paymentMethod: payment.paymentMethod,
            cardNumber: payment.cardNumber,
            expiryYear: payment.expiryYear,
            expiryMonth: payment.expiryMonth,
            birthOfRegistration: payment.birthOfRegistration,
            amount: payment.amount,
            userEmail: this.orderDomain.customer.email,
            passwordTwoDigit: payment.passwordTwoDigit,
        };
    }

    toPaymentDomain(): PaymentDomain {
        return this.orderDomain.payment;
    }
}
