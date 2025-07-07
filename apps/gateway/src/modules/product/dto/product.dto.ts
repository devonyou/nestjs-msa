import { ProductMicroService } from '@app/common';
import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CategoryDto, CategoryResponseDto } from './category.dto';

export class ProductDto implements ProductMicroService.Product {
    @ApiProperty({ description: '상품의 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '상품 이름', example: 'Product 1' })
    @IsString()
    name: string;

    @ApiProperty({ description: '상품 설명', example: 'Product 1 description' })
    @IsString()
    description: string;

    @ApiProperty({ description: '상품 가격', example: 10000 })
    @IsNumber()
    price: number;

    @ApiProperty({ description: '상품 이미지 목록', example: [{ url: 'https://example.com/image.jpg' }] })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    // @Type(() => ProductImage)
    images: ProductMicroService.ProductImage[];

    @ApiProperty({ description: '상품 카테고리', example: { id: 1, name: 'Electronics' } })
    @ValidateNested({ each: true })
    @Type(() => CategoryDto)
    category: CategoryDto;
}

export class ProductResponseDto implements ProductMicroService.ProductResponse {
    @ApiProperty({ description: '상품의 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '상품 이름', example: 'Product 1' })
    @IsString()
    name: string;

    @ApiProperty({ description: '상품 설명', example: 'Product 1 description' })
    @IsString()
    description: string;

    @ApiProperty({ description: '상품 가격', example: 10000 })
    @IsNumber()
    price: number;

    @ApiProperty({ description: '상품 이미지 목록', example: [{ url: 'https://example.com/image.jpg' }] })
    @IsArray()
    images: ProductMicroService.ProductImage[];

    @ApiProperty({ description: '상품 카테고리', example: { id: 1, name: 'Electronics' } })
    @Type(() => CategoryResponseDto)
    category: CategoryResponseDto;

    @ApiProperty({ description: '상품 생성일', example: '2021-01-01T00:00:00.000Z' })
    @IsDateString()
    createdAt: string;

    @ApiProperty({ description: '상품 수정일', example: '2021-01-01T00:00:00.000Z' })
    @IsDateString()
    updatedAt: string;
}

export class ProductListResponseDto implements ProductMicroService.ProductListResponse {
    @ApiProperty({ description: '상품 목록', type: [ProductResponseDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductResponseDto)
    products: ProductResponseDto[];

    @ApiProperty({ description: '상품 총 개수', example: 10 })
    @IsNumber()
    total: number;
}

export class CreateProductRequestDto extends OmitType(ProductDto, ['id', 'category'] as const) {
    @ApiProperty({ description: '상품 카테고리 ID', example: 1 })
    @IsNumber()
    categoryId: number;
}

export class GetProductListQueryDto implements ProductMicroService.GetProductsRequest {
    @ApiProperty({ description: '페이지', example: 1 })
    @IsInt()
    @Transform(({ value }) => Number(value))
    page: number;

    @ApiProperty({ description: '페이지 크기', example: 10 })
    @IsInt()
    @Transform(({ value }) => Number(value))
    limit: number;

    @ApiProperty({ description: '정렬', example: 'createdAt_DESC' })
    @IsString()
    @IsOptional()
    sort: string;

    @ApiProperty({ description: '검색어', example: 'Product 1' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ description: '상품 카테고리 ID', example: 1 })
    @IsInt()
    @Transform(({ value }) => Number(value))
    @IsOptional()
    categoryId?: number;
}

export class UpdateProductRequestDto extends PartialType(
    PickType(ProductDto, ['name', 'description', 'price'] as const),
) {
    @ApiProperty({ description: '상품 카테고리 ID', example: 1 })
    @IsInt()
    @Transform(({ value }) => Number(value))
    @IsOptional()
    categoryId?: number;

    @ApiProperty({ description: '상품 이미지 목록', example: ['https://example.com/image.jpg'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images: string[];
}
