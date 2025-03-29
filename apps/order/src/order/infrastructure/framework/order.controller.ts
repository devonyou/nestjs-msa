import { StartDeliveryUsecase } from './../../usecase/start.delivery.usecase';
import { GrpcInterceptor, OrderMicroService } from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { CreateOrderUsecase } from '../../usecase/create.order.usecase';
import { CreateOrderRequestMapper } from './mapper/create.order.request.mapper';

@Controller('order')
@OrderMicroService.OrderServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class OrderController
    implements OrderMicroService.OrderServiceController
{
    constructor(
        private readonly createOrderUsecase: CreateOrderUsecase,
        private readonly startDeliveryUsecase: StartDeliveryUsecase,
    ) {}

    deliveryStarted(req: OrderMicroService.DeliveryStartedRequest) {
        const { id } = req;
        return this.startDeliveryUsecase.execute(id);
    }

    async createOrder(req: OrderMicroService.CreateOrderRequest) {
        return await this.createOrderUsecase.execute(
            new CreateOrderRequestMapper(req).toDomain(),
        );
    }
}
