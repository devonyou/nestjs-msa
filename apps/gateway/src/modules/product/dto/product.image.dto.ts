import { ProductMicroService } from '@app/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductImageDto implements ProductMicroService.ProductImage {
    @ApiProperty({ description: '이미지 ID', example: 1 })
    @IsNumber()
    @IsOptional()
    id?: number;

    @ApiProperty({ description: '메인 이미지 여부', example: true })
    @IsBoolean()
    @IsOptional()
    main?: boolean;

    @ApiProperty({ description: '이미지 URL', example: 'https://example.com/image.jpg' })
    @IsString()
    url: string;
}

export class ProductImageResponseDto extends ProductImageDto {
    @ApiProperty({ description: '상품 ID', example: 1 })
    @IsNumber()
    @IsOptional()
    productId?: number;
}

export class CreateProductImageDto extends OmitType(ProductImageDto, ['id'] as const) {}
