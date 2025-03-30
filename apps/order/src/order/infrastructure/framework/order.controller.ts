import { StartDeliveryUsecase } from './../../usecase/start.delivery.usecase';
import { GrpcInterceptor, OrderMicroService } from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { CreateOrderUsecase } from '../../usecase/create.order.usecase';
import { CreateOrderRequestMapper } from './mapper/create.order.request.mapper';
import { EventPattern } from '@nestjs/microservices';
import { CancelOrderUsecase } from '../../usecase/cancel.order.usecase';

@Controller('order')
@OrderMicroService.OrderServiceControllerMethods()
export class OrderController
    implements OrderMicroService.OrderServiceController
{
    constructor(
        private readonly createOrderUsecase: CreateOrderUsecase,
        private readonly startDeliveryUsecase: StartDeliveryUsecase,
        private readonly cancelOrderUsecase: CancelOrderUsecase,
    ) {}

    @UseInterceptors(GrpcInterceptor)
    deliveryStarted(req: OrderMicroService.DeliveryStartedRequest) {
        const { id } = req;
        return this.startDeliveryUsecase.execute(id);
    }

    @UseInterceptors(GrpcInterceptor)
    async createOrder(req: OrderMicroService.CreateOrderRequest) {
        return await this.createOrderUsecase.execute(
            new CreateOrderRequestMapper(req).toDomain(),
        );
    }

    @EventPattern('order.notification.fail')
    async orderNotificationFail(orderId: string) {
        await this.cancelOrderUsecase.execute(orderId);
    }
}
