import { OrderMicroService } from '@app/common';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class OrderDeliveryDto implements OrderMicroService.Delivery {
    @ApiProperty({ description: '배송 ID', example: '1' })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '주문 ID', example: '1' })
    @IsString()
    orderId: string;

    @ApiProperty({ description: '우편번호', example: '12345' })
    @IsString()
    postCode: string;

    @ApiProperty({ description: '주소', example: '123 Main St' })
    @IsString()
    street: string;
}

export class OrderDeliveryResponseDto implements OrderMicroService.DeliveryResponse {
    @ApiProperty({ description: '배송 ID', example: '1' })
    @IsString()
    id: number;

    @ApiProperty({ description: '주문 ID', example: '1' })
    @IsString()
    orderId: string;

    @ApiProperty({ description: '우편번호', example: '12345' })
    @IsString()
    postCode: string;

    @ApiProperty({ description: '주소', example: '123 Main St' })
    @IsString()
    street: string;
}

export class CreateOrderDeliveryDto extends PickType(OrderDeliveryDto, ['postCode', 'street'] as const) {}
