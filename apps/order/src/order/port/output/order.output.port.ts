import { OrderDomain } from '../../domain/order.domain';

export interface OrderOutputPort {
    createOrder(order: OrderDomain): Promise<OrderDomain>;

    updateOrder(order: OrderDomain): Promise<OrderDomain>;

    findOrderById(orderId: string): Promise<OrderDomain>;
}
