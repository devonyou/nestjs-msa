import { PaymentModel } from 'apps/payment/src/payment/domain/payment.model';
import { PaymentDocument } from '../entity/payment.document';

export class PaymentDocumentMapper {
    constructor(private readonly paymentDocument: PaymentDocument) {}

    toDomain() {
        const payment = new PaymentModel(this.paymentDocument);
        payment.setId(this.paymentDocument.id);
        return payment;
    }
}
