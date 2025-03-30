import { PaymentModel } from 'apps/payment-command/src/payment/domain/payment.model';
import { PaymentDocument } from '../entity/payment.document';

export class PaymentDocumentMapper {
    constructor(private readonly paymentDocument: PaymentDocument) {}

    toDomain() {
        const payment = new PaymentModel(this.paymentDocument);
        payment.setId(this.paymentDocument.id);
        return payment;
    }

    toPaymentQueryMicroservicePayload() {
        return {
            _id: this.paymentDocument._id,
            userEmail: this.paymentDocument.userEmail,
            amount: this.paymentDocument.amount,
            paymentStatus: this.paymentDocument.paymentStatus,
            cardNumberLastFourDigits: this.paymentDocument.cardNumber.slice(-4),
            orderId: this.paymentDocument.orderId,
        };
    }
}
