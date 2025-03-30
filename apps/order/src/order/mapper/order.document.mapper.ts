import { OrderDocument } from '../adapter/mongoose/document/order.document';
import { OrderDomain } from '../domain/order.domain';
import { PaymentMethod } from '../domain/payment.domain';

export class OrderDocumentMapper {
    constructor(private readonly orderDocument: OrderDocument) {}

    toDomain(): OrderDomain {
        const orderDomain = new OrderDomain({
            customer: this.orderDocument.customer,
            deliveryAddress: this.orderDocument.deliveryAddress,
            products: this.orderDocument.products,
        });
        orderDomain.setId(this.orderDocument._id.toString());
        orderDomain.setPayment({
            ...this.orderDocument.payment,
        });
        return orderDomain;
    }

    private parsePaymentMethod(paymentMethod: string): PaymentMethod {
        const paymentMethodValues = Object.values(PaymentMethod);
        if (!paymentMethodValues.includes(paymentMethod as PaymentMethod)) {
            throw new Error('알 수 없는 결제 방식입니다.');
        }
        return paymentMethod as PaymentMethod;
    }
}
