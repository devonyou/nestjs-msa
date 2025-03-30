import { OrderMicroService } from '@app/common';

export interface OrderInputPort {
    createOrder(
        request: OrderMicroService.CreateOrderRequest,
    ): Promise<OrderMicroService.CreateOrderResponse>;

    deliveryStarted(
        request: OrderMicroService.DeliveryStartedRequest,
    ): Promise<OrderMicroService.DeliveryStartedResponse>;
}
