import { Body, Controller, Post, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create.order.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common/interceptor';
import { DeliveryStartedDto } from './dto/delivery.started.dto';
import { OrderStatus } from './entity/order.entity';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    // @Post()
    // @UsePipes(ValidationPipe)
    // async createOrder(@Authorization() token: string, @Body() dto: CreateOrderDto) {
    //     return await this.orderService.createOrder(token, dto);
    // }

    @EventPattern({ cmd: 'delivery-started' })
    @UseInterceptors(RpcInterceptor)
    deliveryStarted(@Payload() dto: DeliveryStartedDto) {
        const { id } = dto;
        return this.orderService.changeOrderStatus(id, OrderStatus.deliveryStarted);
    }

    @EventPattern({ cmd: 'create-order' })
    @UseInterceptors(RpcInterceptor)
    async createOrder(@Payload() payload: CreateOrderDto) {
        return await this.orderService.createOrder(payload);
    }
}
