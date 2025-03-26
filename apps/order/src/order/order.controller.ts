import { Body, Controller, Post, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create.order.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { GrpcInterceptor, RpcInterceptor } from '@app/common/interceptor';
import { DeliveryStartedDto } from './dto/delivery.started.dto';
import { OrderStatus } from './entity/order.entity';
import { OrderMicroService } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';
import { Metadata } from '@grpc/grpc-js';

@Controller('order')
@OrderMicroService.OrderServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class OrderController implements OrderMicroService.OrderServiceController {
    constructor(private readonly orderService: OrderService) {}

    // @EventPattern({ cmd: 'delivery-started' })
    // @UseInterceptors(RpcInterceptor)
    deliveryStarted(req: OrderMicroService.DeliveryStartedRequest) {
        const { id } = req;
        return this.orderService.changeOrderStatus(id, OrderStatus.deliveryStarted);
    }

    // @EventPattern({ cmd: 'create-order' })
    // @UseInterceptors(RpcInterceptor)
    // async createOrder(payload: CreateOrderDto) {
    async createOrder(req: OrderMicroService.CreateOrderRequest, metadata: Metadata) {
        const res = (
            await this.orderService.createOrder(
                {
                    ...req,
                    payment: {
                        ...req.payment,
                        paymentMethod: req.payment.paymentMethod as PaymentMethod,
                    },
                },
                metadata,
            )
        ).toJSON();

        return {
            ...res,
            product: res.products,
            status: res.status.toString(),
        };
    }
}
