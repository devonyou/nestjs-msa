export enum PaymentMethod {
    creditCard = 'CreditCard',
    kakaoPay = 'KakaoPay',
}

export class PaymentEntity {
    paymentId: string;
    paymentMethod: PaymentMethod;
    paymentName: string;
    amount: number;

    constructor(params: PaymentEntity) {
        this.paymentId = params.paymentId;
        this.paymentMethod = params.paymentMethod;
        this.paymentName = params.paymentName;
        this.amount = params.amount;
    }
}
