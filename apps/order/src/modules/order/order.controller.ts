import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderMicroService } from '@app/common';
import { OrderResponseMapper } from './mapper/order.response.mapper';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
@OrderMicroService.OrderServiceControllerMethods()
export class OrderController implements OrderMicroService.OrderServiceController {
    constructor(private readonly orderService: OrderService) {}

    async initiateOrder(request: OrderMicroService.InitiateOrderRequest): Promise<OrderMicroService.OrderResponse> {
        const result = await this.orderService.initiateOrder(request);
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

    @MessagePattern('order.initiate')
    async processInitiateOrder(@Payload() request: OrderMicroService.InitiateOrderRequest, @Ctx() context: RmqContext) {
        return await this.orderService.processInitiateOrder(request, context);
    }
}
