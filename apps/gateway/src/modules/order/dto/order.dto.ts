import { OrderMicroService } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderDeliveryDto, OrderDeliveryDto, OrderDeliveryResponseDto } from './order.delivery.dto';
import { CreateOrderItemDto, OrderItemDto, OrderItemResponseDto } from './order.item.dto';

export class OrderDto implements OrderMicroService.Order {
    @ApiProperty({ description: '주문 ID', example: '1' })
    @IsString()
    id: string;

    @ApiProperty({ description: '사용자 ID', example: '1' })
    @IsNumber()
    userId: number;

    @ApiProperty({ description: '주문 상품 목록', example: [{ productId: 1, quantity: 1 }] })
    @IsArray()
    @ArrayNotEmpty({ message: '주문 상품이 없습니다' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ description: '배송 정보', example: { postCode: '12345', street: '123 Main St' } })
    @IsNotEmpty({ message: '배송 정보가 없습니다' })
    @ValidateNested()
    @Type(() => OrderDeliveryDto)
    delivery: OrderDeliveryDto;

    @ApiProperty({ description: '주문 상태', example: 'CREATED' })
    @IsEnum(OrderMicroService.OrderStatus)
    status: OrderMicroService.OrderStatus;

    @ApiProperty({ description: '주문 금액', example: 10000 })
    @IsNumber()
    amount: number;

    @ApiProperty({ description: '주문 상품 목록', example: [{ productId: 1, quantity: 1 }] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    orderItems: OrderItemDto[];

    @ApiProperty({ description: '결제 ID', example: '1' })
    @IsNumber()
    paymentId: number;
}

export class OrderResponseDto implements OrderMicroService.OrderResponse {
    @ApiProperty({ description: '주문 ID', example: '1' })
    @IsString()
    id: string;

    @ApiProperty({ description: '사용자 ID', example: '1' })
    @IsNumber()
    userId: number;

    @ApiProperty({ description: '주문 상태', example: 'CREATED' })
    @IsEnum(OrderMicroService.OrderStatus)
    status: OrderMicroService.OrderStatus;

    @ApiProperty({ description: '주문 금액', example: 10000 })
    @IsNumber()
    amount: number;

    @ApiProperty({ description: '배송 정보', example: { postCode: '12345', street: '123 Main St' } })
    @ValidateNested()
    @Type(() => OrderDeliveryResponseDto)
    delivery: OrderDeliveryResponseDto;

    @ApiProperty({ description: '주문 상품 목록', example: [{ productId: 1, quantity: 1 }] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemResponseDto)
    orderItems: OrderItemResponseDto[];

    @ApiProperty({ description: '결제 ID', example: '1' })
    @IsNumber()
    paymentId: number;

    @ApiProperty({ description: '주문 생성일', example: '2021-01-01T00:00:00.000Z' })
    @IsDateString()
    createdAt: string;

    @ApiProperty({ description: '주문 수정일', example: '2021-01-01T00:00:00.000Z' })
    @IsDateString()
    updatedAt: string;
}

export class OrderListResponseDto implements OrderMicroService.OrderListResponse {
    @ApiProperty({ description: '주문 목록', example: [{ id: '1', userId: 1, amount: 10000 }] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderResponseDto)
    orders: OrderResponseDto[];
}

export class CreateOrderRequestDto {
    @ApiProperty({ description: '주문 상품 목록', example: [{ productId: 1, quantity: 1 }] })
    @IsArray()
    @ArrayNotEmpty({ message: '주문 상품이 없습니다' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiProperty({ description: '배송 정보', example: { postCode: '12345', street: '123 Main St' } })
    @ValidateNested()
    @Type(() => CreateOrderDeliveryDto)
    delivery: CreateOrderDeliveryDto;
}

export class InitiateOrderRequestDto {
    @ApiProperty({ description: '주문 상품 목록', example: [{ productId: 1, quantity: 1 }] })
    @IsArray()
    @ArrayNotEmpty({ message: '주문 상품이 없습니다' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiProperty({ description: '배송 정보', example: { postCode: '12345', street: '123 Main St' } })
    @ValidateNested()
    @Type(() => CreateOrderDeliveryDto)
    delivery: CreateOrderDeliveryDto;
}

export class CompleteOrderRequestDto {
    @ApiProperty({ description: '주문 ID', example: '1' })
    @IsString()
    orderId: string;

    @ApiProperty({ description: '결제 공급자 ID', example: '1' })
    @IsString()
    providerPaymentId: string;
}
