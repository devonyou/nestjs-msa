import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { createGrpcMetadata, OrderMicroService } from '@app/common';
import { InitiateOrderRequestDto, UpdateOrderStatusDto } from './dto/order.dto';
import { lastValueFrom } from 'rxjs';
import { throwHttpExceptionFromGrpcError } from '../../common/http/http.rpc.exception';

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

    async initiateOrder(sub: number, initiateOrderRequestDto: InitiateOrderRequestDto) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.initiateOrder.name);
            const stream = this.orderService.initiateOrder({ ...initiateOrderRequestDto, userId: sub }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async getOrderByIdAndUser(userId: number, orderId: string) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.getOrderByIdAndUser.name);
            const stream = this.orderService.getOrderByIdAndUser({ orderId, userId }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async getOrdersByUserId(userId: number) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.getOrdersByUserId.name);
            const stream = this.orderService.getOrdersByUserId({ userId: userId }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async updateOrderStatus(userId: number, orderId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.updateOrderStatus.name);
            const stream = this.orderService.updateOrderStatus(
                { orderId, userId, status: updateOrderStatusDto.status },
                metadata,
            );
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }
}
