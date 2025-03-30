import { PaymentModel } from '../../../domain/payment.model';
import { PaymentOutputPort } from '../../../port/output/payment.output.port';

export class PortoneAdapter implements PaymentOutputPort {
    async processPayment(payment: PaymentModel): Promise<boolean> {
        return await new Promise(resolve =>
            setTimeout(() => resolve(true), 1000),
        );
    }

    async cancelPayment(payment: any): Promise<boolean> {
        return await new Promise(resolve =>
            setTimeout(() => resolve(true), 1000),
        );
    }
}
