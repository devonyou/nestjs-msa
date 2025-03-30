import { CustomerDomain } from './customer.domain';
import { DeliveryAddressDomain } from './delivery.address.domain';
import { PaymentDomain } from './payment.domain';
import { ProductDomain } from './product.domain';

export enum OrderStatus {
    pending = 'Pending',
    paymentCanceled = 'PaymentCanceled',
    paymentFailed = 'PaymentFailed',
    paymentProcessed = 'PaymentProcessed',
    deliveryStarted = 'DeliveryStarted',
    deliveryDone = 'DeliveryDone',
}

export class OrderDomain {
    id: string;
    customer: CustomerDomain;
    products: ProductDomain[];
    deliveryAddress: DeliveryAddressDomain;
    payment: PaymentDomain;
    status: OrderStatus;
    amount: number;

    constructor(
        params: Pick<OrderDomain, 'customer' | 'products' | 'deliveryAddress'>,
    ) {
        this.customer = params.customer;
        this.products = params.products;
        this.deliveryAddress = params.deliveryAddress;
    }

    setId(id: string) {
        this.id = id;
    }

    setPayment(payment: PaymentDomain) {
        if (!this.id) throw new Error('ID가 없는 주문입니다.');
        this.payment = payment;
    }

    calcAmount() {
        if (!this.products.length) throw new Error('상품이 없는 주문입니다.');
        const amount = this.products.reduce((acc, p) => acc + p.price, 0);
    }

    processPayment() {
        this.status = OrderStatus.paymentProcessed;
    }

    cancelPayment() {
        this.status = OrderStatus.paymentCanceled;
    }

    startDelivery() {
        this.status = OrderStatus.deliveryStarted;
    }

    finishDelivery() {
        this.status = OrderStatus.deliveryDone;
    }
}
