import { PaymentModel } from '../../domain/payment.model';

export interface DatabaseOutputPort {
    savePayment(paymentModel: PaymentModel): Promise<PaymentModel>;

    updatePayment(paymentModel: PaymentModel): Promise<PaymentModel>;
}
