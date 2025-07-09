import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderMicroService } from '@app/common';
import { OrderResponseMapper } from './mapper/order.response.mapper';

@Controller()
@OrderMicroService.OrderServiceControllerMethods()
export class OrderController implements OrderMicroService.OrderServiceController {
    constructor(private readonly orderService: OrderService) {}

    async createOrder(request: OrderMicroService.CreateOrderRequest): Promise<OrderMicroService.OrderResponse> {
        const result = await this.orderService.createOrder(request);
        return OrderResponseMapper.toOrderResponse(result);
    }

    async getOrderByIdAndUser(
        request: OrderMicroService.GetOrderByIdAndUserRequest,
    ): Promise<OrderMicroService.OrderResponse> {
        const result = await this.orderService.getOrderByIdAndUser(request);
        return OrderResponseMapper.toOrderResponse(result);
    }

    async getOrdersByUserId(
        request: OrderMicroService.GetOrdersByUserIdRequest,
    ): Promise<OrderMicroService.OrderListResponse> {
        const result = await this.orderService.getOrdersByUserId(request.userId);
        return {
            orders: result.map(order => OrderResponseMapper.toOrderResponse(order)),
        };
    }

    async updateOrderStatus(
        request: OrderMicroService.UpdateOrderStatusRequest,
    ): Promise<OrderMicroService.OrderResponse> {
        const result = await this.orderService.updateOrderStatus(request);
        return OrderResponseMapper.toOrderResponse(result);
    }
}
