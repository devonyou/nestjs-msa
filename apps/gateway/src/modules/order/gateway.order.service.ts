import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OrderMicroService } from '@app/common';

@Injectable()
export class GatewayOrderService {
    private orderService: OrderMicroService.OrderServiceClient;

    constructor(
        @Inject(OrderMicroService.ORDER_SERVICE_NAME)
        private readonly orderMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.orderService = this.orderMicroService.getService<OrderMicroService.OrderServiceClient>(
            OrderMicroService.ORDER_SERVICE_NAME,
        );
    }
}
