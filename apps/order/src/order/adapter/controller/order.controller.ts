import {
    CreateOrderRequest,
    CreateOrderResponse,
    DeliveryStartedRequest,
    DeliveryStartedResponse,
} from '@app/common/grpc/proto/order';
import { OrderInputPort } from '../../port/input/order.input.port';
import { Controller } from '@nestjs/common';
import { CreateOrderUsecase } from '../../usecase/create.order.usecase';
import { CreateOrderRequestMapper } from '../../mapper/create.order.request.mapper';
import { OrderDomainMapper } from '../../mapper/order.domain.mapper';
import { OrderMicroService } from '@app/common';
import { StartDeliveryUsecase } from '../../usecase/delivery.started.usecase';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CancelOrderUsecase } from '../../usecase/cancel.order.usecase';

@Controller()
@OrderMicroService.OrderServiceControllerMethods()
export class OrderController implements OrderInputPort {
    constructor(
        private readonly createOrderUsecase: CreateOrderUsecase,
        private readonly startDeliveryUsecase: StartDeliveryUsecase,
        private readonly cancelOrderUsecase: CancelOrderUsecase,
    ) {}

    async createOrder(
        request: CreateOrderRequest,
    ): Promise<CreateOrderResponse> {
        const dto = new CreateOrderRequestMapper(request).toCreateOrderDto();
        const orderDomain = await this.createOrderUsecase.execute(dto);
        return new OrderDomainMapper(orderDomain).toCreateOrderResponse();
    }

    async deliveryStarted(
        request: DeliveryStartedRequest,
    ): Promise<DeliveryStartedResponse> {
        const result = await this.startDeliveryUsecase.execute(request.id);
        return result;
    }

    @EventPattern('order.notification.fail')
    async orderNotificationFail(@Payload() orderId: string) {
        await this.cancelOrderUsecase.execute(orderId);
    }
}
