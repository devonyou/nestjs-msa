import { OrderEntity } from 'apps/order/src/order/domain/order.entity';
import { OrderDocument } from '../../entity/order.entity';

export class OrderDocumentMapper {
    constructor(private readonly orderDocument: OrderDocument) {}

    toDomain(): OrderEntity {
        const order = new OrderEntity({
            customer: this.orderDocument.customer,
            deliveryAddress: this.orderDocument.deliveryAddress,
            product: this.orderDocument.products,
        });

        order.setId(this.orderDocument._id.toString());
        order.setPayment(this.orderDocument.payment);
        return order;
    }
}
