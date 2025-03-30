export enum PaymentMethod {
    creditCard = 'CreditCard',
    kakao = 'Kakao',
}

export class PaymentDomain {
    paymentId: string;
    paymentMethod: PaymentMethod;
    paymentName: string;
    amount: number;

    constructor(params: PaymentDomain) {
        this.paymentId = params.paymentId;
        this.paymentMethod = params.paymentMethod;
        this.paymentName = params.paymentName;
        this.amount = params.amount;
    }
}
