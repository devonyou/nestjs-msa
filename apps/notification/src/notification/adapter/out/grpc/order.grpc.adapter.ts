import { ORDER_SERVICE, OrderMicroService } from '@app/common';
import { ORDER_SERVICE_NAME } from '@app/common/grpc/proto/order';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderGrpcOutPort } from '../../../port/out/order.grpc.out.port';

export class OrderGrpcAdapter implements OrderGrpcOutPort, OnModuleInit {
    private orderService: OrderMicroService.OrderServiceClient;

    constructor(
        @Inject(ORDER_SERVICE) private readonly orderMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.orderService =
            this.orderMicroService.getService(ORDER_SERVICE_NAME);
    }

    async deliveryStarted(orderId: string): Promise<boolean> {
        await lastValueFrom(this.orderService.deliveryStarted({ id: orderId }));
        return true;
    }
}
