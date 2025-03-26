import { UserMeta } from './../../../../libs/common/src/dto/interface/user.meta.dto';
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
        this.orderService = this.orderMicroService.getService('OrderService');
    }

    async createOrder(
        userPayload: UserPayloadDto,
        dto: CreateOrderDto,
        metadata: Metadata,
    ) {
        return await lastValueFrom(
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
    }
}
