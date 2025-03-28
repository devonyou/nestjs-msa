import { PaymentModel } from 'apps/payment/src/payment/domain/payment.model';
import { PaymentEntity } from '../entity/payment.entity';

export class PaymentEntityMapper {
    constructor(private readonly paymentEntity: PaymentEntity) {}

    toDomain() {
        const payment = new PaymentModel({
            orderId: this.paymentEntity.orderId,
            paymentMethod: this.paymentEntity.paymentMethod,
            cardNumber: this.paymentEntity.cardNumber,
            expiryYear: this.paymentEntity.expiryYear,
            expiryMonth: this.paymentEntity.expiryMonth,
            birthOfRegistration: this.paymentEntity.birthOfRegistration,
            passwordTwoDigit: this.paymentEntity.passwordTwoDigit,
            amount: this.paymentEntity.amount,
            userEmail: this.paymentEntity.userEmail,
        });
        payment.setId(this.paymentEntity.id);

        return payment;
    }
}
