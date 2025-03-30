import { OrderDomain } from '../../domain/order.domain';
import { PaymentDomain } from '../../domain/payment.domain';
import { PaymentDto } from '../../dto/create.order.dto';

export interface PaymentOutputPort {
    processPayment(
        orderDomain: OrderDomain,
        payment: PaymentDto,
    ): Promise<PaymentDomain>;
}
