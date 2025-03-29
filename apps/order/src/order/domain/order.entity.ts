import { CustomerEntity } from './customer.entity';
import { DeliveryAddressEntity } from './delivery.address.entity';
import { PaymentEntity } from './payment.entity';
import { ProductEntity } from './product.entity';

export enum OrderStatus {
    pending = 'Pending',
    paymentCanceled = 'PaymentCanceled',
    paymentFailed = 'PaymentFailed',
    paymentProcessed = 'PaymentProcessed',
    deliveryStarted = 'DeliveryStarted',
    deliveryDone = 'DeliveryDone',
}

export class OrderEntity {
    id: string;
    customer: CustomerEntity;
    product: ProductEntity[];
    deliveryAddress: DeliveryAddressEntity;
    payment: PaymentEntity;
    status: OrderStatus;
    totalAmount: number;

    constructor(
        param: Pick<OrderEntity, 'customer' | 'product' | 'deliveryAddress'>,
    ) {
        this.customer = param.customer;
        this.product = param.product;
        this.deliveryAddress = param.deliveryAddress;
    }

    setId(id: string) {
        this.id = id;
    }

    setPayment(payment: PaymentEntity) {
        if (!this.id) throw new Error('ID가 없는 주문입니다.');
        this.payment = payment;
    }

    calulateTotalAmount() {
        if (!this.product.length)
            throw new Error('주문에는 상품이 하나 이상 있어야합니다.');
        const total = this.product.reduce((acc, v) => acc + v.price, 0);
        if (total < 0) throw new Error('결제 총액은 0보다 커야합니다.');
        this.totalAmount = total;
    }

    processPayment() {
        if (!this.id) throw new Error('ID가 없는 주문입니다.');
        if (!this.product.length)
            throw new Error('주문에는 상품이 하나 이상 있어야합니다.');
        if (!this.deliveryAddress)
            throw new Error('결제를 진행하기 위해선 배송 주소가 필요합니다.');
        if (+this.totalAmount < 0)
            throw new Error('결제 총액은 0보다 커야합니다.');
        if (this.status !== OrderStatus.pending)
            throw new Error(
                'OrderStatus.pending 상태에서만 결제를 진행 가능합니다.',
            );

        this.status = OrderStatus.paymentProcessed;
    }

    cancelOrder() {
        this.status = OrderStatus.paymentCanceled;
    }

    startDelivery() {
        if (this.status !== OrderStatus.paymentProcessed)
            throw new Error(
                'OrderStatus.paymentProcessed 상태에서만 배송시작이 진행 가능합니다.',
            );
        this.status = OrderStatus.deliveryStarted;
    }

    finishDelivery() {
        if (this.status !== OrderStatus.deliveryStarted)
            throw new Error(
                'OrderStatus.deliveryStarted 상태에서만 배송을 완료할수 있습니다.',
            );
        this.status = OrderStatus.deliveryDone;
    }
}
