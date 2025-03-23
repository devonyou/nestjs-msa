import { UserMeta } from './../../../../libs/common/src/dto/interface/user.meta.dto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';
import { ORDER_SERVICE, OrderMicroService, UserPayloadDto } from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService implements OnModuleInit {
    private orderService: OrderMicroService.OrderServiceClient;

    constructor(@Inject(ORDER_SERVICE) private readonly orderMicroService: ClientGrpc) {}

    onModuleInit() {
        this.orderService = this.orderMicroService.getService('OrderService');
    }

    async createOrder(userPayload: UserPayloadDto, dto: CreateOrderDto) {
        return await lastValueFrom(
            this.orderService.createOrder({
                meta: {
                    user: userPayload,
                },
                ...dto,
            }),
        );
    }
}
