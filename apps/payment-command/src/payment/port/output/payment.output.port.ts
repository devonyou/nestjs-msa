import { PaymentModel } from '../../domain/payment.model';

export interface PaymentOutputPort {
    processPayment(payment: PaymentModel): Promise<boolean>;
}
