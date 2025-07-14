import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { createGrpcMetadata, OrderMicroService } from '@app/common';
import { CancelOrderRequestDto, CompleteOrderRequestDto, InitiateOrderRequestDto } from './dto/order.dto';
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

    async initiateOrder(userId: number, dto: InitiateOrderRequestDto) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.initiateOrder.name);
            const stream = this.orderService.initiateOrder({ ...dto, userId: userId }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async completeOrder(user: UserPayload, dto: CompleteOrderRequestDto) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.completeOrder.name);
            const stream = this.orderService.completeOrder(
                { ...dto, userId: user.sub, userEmail: user.email },
                metadata,
            );
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

    async cancelOrder(userId: number, dto: CancelOrderRequestDto) {
        try {
            const metadata = createGrpcMetadata(GatewayOrderService.name, this.cancelOrder.name);
            const stream = this.orderService.cancelOrder({ ...dto, userId }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }
}
