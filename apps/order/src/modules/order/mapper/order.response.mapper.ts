import { OrderMicroService } from '@app/common';
import { OrderEntity } from '../../../entitites/order.entity';
import { OrderItemEntity } from 'apps/order/src/entitites/order.item.entity';
import { OrderDeliveryEntity } from 'apps/order/src/entitites/order.delivery.entity';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';

export class OrderResponseMapper {
    static toOrderResponse(order: OrderEntity): OrderMicroService.OrderResponse {
        if (!order) {
            throw new GrpcNotFoundException('주문을 찾을 수 없습니다');
        }

        try {
            return {
                ...order,
                id: order.id,
                orderItems: order.items?.map(item => this.toOrderItemResponse(item)),
                delivery: order.delivery && this.toDeliveryResponse(order.delivery),
                paymentId: order.paymentId,
                createdAt: order.createdAt && new Date(order.createdAt).toISOString(),
                updatedAt: order.updatedAt && new Date(order.updatedAt).toISOString(),
            };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    static toOrderItemResponse(item: OrderItemEntity): OrderMicroService.OrderItemResponse {
        try {
            return {
                ...item,
            };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    static toDeliveryResponse(delivery: OrderDeliveryEntity): OrderMicroService.DeliveryResponse {
        try {
            return {
                ...delivery,
                orderId: delivery.order?.id.toString(),
            };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    static toStatusResponse(status: OrderMicroService.OrderStatus): OrderMicroService.OrderStatus {
        switch (status) {
            case OrderMicroService.OrderStatus.CREATED:
                return OrderMicroService.OrderStatus.CREATED;
            case OrderMicroService.OrderStatus.STOCK_RESERVED:
                return OrderMicroService.OrderStatus.STOCK_RESERVED;
            case OrderMicroService.OrderStatus.PAYMENT_PENDING:
                return OrderMicroService.OrderStatus.PAYMENT_PENDING;
            case OrderMicroService.OrderStatus.PAYMENT_SUCCESS:
                return OrderMicroService.OrderStatus.PAYMENT_SUCCESS;
            case OrderMicroService.OrderStatus.PAYMENT_FAILED:
                return OrderMicroService.OrderStatus.PAYMENT_FAILED;
            case OrderMicroService.OrderStatus.CANCELED:
                return OrderMicroService.OrderStatus.CANCELED;
            case OrderMicroService.OrderStatus.SHIPPED:
                return OrderMicroService.OrderStatus.SHIPPED;
            case OrderMicroService.OrderStatus.COMPLETED:
                return OrderMicroService.OrderStatus.COMPLETED;
            case OrderMicroService.OrderStatus.UNRECOGNIZED:
                return OrderMicroService.OrderStatus.UNRECOGNIZED;
            default:
                return OrderMicroService.OrderStatus.UNRECOGNIZED;
        }
    }
}
