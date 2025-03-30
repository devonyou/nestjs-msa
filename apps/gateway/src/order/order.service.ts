import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order.dto';
import {
    constructorMetadata,
    ORDER_SERVICE,
    OrderMicroService,
    UserPayloadDto,
} from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class OrderService implements OnModuleInit {
    private orderService: OrderMicroService.OrderServiceClient;

    constructor(
        @Inject(ORDER_SERVICE) private readonly orderMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.orderService =
            this.orderMicroService.getService<OrderMicroService.OrderServiceClient>(
                'OrderService',
            );
    }

    async createOrder(
        userPayload: UserPayloadDto,
        dto: CreateOrderDto,
        metadata: Metadata,
    ) {
        const resp = await lastValueFrom(
            this.orderService.createOrder(
                {
                    meta: {
                        user: userPayload,
                    },
                    ...dto,
                },
                constructorMetadata(
                    OrderService.name,
                    this.createOrder.name,
                    metadata,
                ),
            ),
        );
        return resp;
    }
}
