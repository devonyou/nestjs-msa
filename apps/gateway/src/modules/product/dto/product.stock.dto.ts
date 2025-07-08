import { ProductMicroService } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ProductDto, ProductResponseDto } from './product.dto';
import { Type } from 'class-transformer';

export class ProductStockDto implements ProductMicroService.Stock {
    @ApiProperty({ description: '재고 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '재고 수량', example: 10 })
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: '상품', type: ProductDto })
    product: ProductMicroService.Product;
}

export class ProductStockResponseDto implements ProductMicroService.StockResponse {
    @ApiProperty({ description: '재고 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '재고 수량', example: 10 })
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: '상품', type: ProductResponseDto })
    @Type(() => ProductResponseDto)
    product: ProductMicroService.ProductResponse;
}

export class UpsertStockRequestDto implements Omit<ProductMicroService.UpsertStockQuantityRequest, 'productId'> {
    @ApiProperty({ description: '재고 수량', example: 10 })
    @IsNumber()
    quantity: number;
}
