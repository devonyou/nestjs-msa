export enum PaymentStatus {
    pending = 'Pending',
    rejected = 'Rejected',
    approved = 'Approved',
}

export enum PaymentMethod {
    creditCard = 'CreditCard',
    kakao = 'Kakao',
}

export enum NotificationStatus {
    pending = 'pending',
    sent = 'sent',
}

export interface ConstPaymentModel {
    orderId: string;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    expiryYear: string;
    expiryMonth: string;
    birthOfRegistration: string;
    passwordTwoDigit: string;
    amount: number;
    userEmail: string;
}

export class PaymentModel {
    id: string;
    orderId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    expiryYear: string;
    expiryMonth: string;
    birthOfRegistration: string;
    passwordTwoDigit: string;
    notificationStatus: NotificationStatus;
    amount: number;
    userEmail: string;

    constructor(params: ConstPaymentModel) {
        // this.id
        this.orderId = params.orderId;
        this.paymentStatus = PaymentStatus.pending;
        this.paymentMethod = params.paymentMethod;
        this.cardNumber = params.cardNumber;
        this.expiryYear = params.expiryYear;
        this.expiryMonth = params.expiryMonth;
        this.birthOfRegistration = params.birthOfRegistration;
        this.passwordTwoDigit = params.passwordTwoDigit;
        this.notificationStatus = NotificationStatus.pending;
        this.amount = params.amount;
        this.userEmail = params.userEmail;
    }

    setId(id: string) {
        this.id = id;
    }

    processPayment() {
        if (!this.id) throw new Error('ID가 없는 주문입니다.');
        this.paymentStatus = PaymentStatus.approved;
    }

    rejectPayment() {
        if (!this.id) throw new Error('ID가 없는 주문입니다.');
        this.paymentStatus = PaymentStatus.rejected;
    }

    sendNotification() {
        this.notificationStatus = NotificationStatus.sent;
    }
}
