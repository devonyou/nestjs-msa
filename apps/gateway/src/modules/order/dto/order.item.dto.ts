import { OrderMicroService } from '@app/common';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class OrderItemDto implements OrderMicroService.OrderItem {
    @ApiProperty({ description: '상품 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '상품 ID', example: 1 })
    @IsNumber()
    productId: number;

    @ApiProperty({ description: '상품 이름', example: '상품 이름' })
    @IsString()
    productName: string;

    @ApiProperty({ description: '수량', example: 1 })
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: '상품 가격', example: 10000 })
    @IsNumber()
    price: number;
}

export class OrderItemResponseDto implements OrderMicroService.OrderItemResponse {
    @ApiProperty({ description: '상품 ID', example: 1 })
    @IsString()
    id: number;

    @ApiProperty({ description: '상품 가격', example: 10000 })
    @IsNumber()
    price: number;

    @ApiProperty({ description: '상품 ID', example: 1 })
    @IsNumber()
    productId: number;

    @ApiProperty({ description: '상품 이름', example: '상품 이름' })
    @IsString()
    productName: string;

    @ApiProperty({ description: '수량', example: 1 })
    @IsNumber()
    quantity: number;
}

export class CreateOrderItemDto extends PickType(OrderItemDto, ['productId', 'quantity'] as const) {}
