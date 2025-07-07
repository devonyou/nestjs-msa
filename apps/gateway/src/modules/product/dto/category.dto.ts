import { ProductMicroService } from '@app/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CategoryDto implements ProductMicroService.Category {
    @ApiProperty({ description: '카테고리의 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '카테고리 이름', example: 'Electronics' })
    @IsString()
    @IsNotEmpty({ message: '이름은 필수입니다.' })
    name: string;

    @ApiProperty({ description: '카테고리 설명', example: '전자제품 카테고리' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class CategoryResponseDto implements ProductMicroService.CategoryResponse {
    @ApiProperty({ description: '카테고리의 ID', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: '카테고리 이름', example: 'Electronics' })
    @IsString()
    name: string;

    @ApiProperty({ description: '카테고리 설명', example: '전자제품 카테고리' })
    @IsString()
    description: string;

    @ApiProperty({ description: '상위 카테고리', example: { id: 1, name: 'Electronics' } })
    @IsOptional()
    parent?: ProductMicroService.Category;

    @ApiProperty({ description: '하위 카테고리 목록', example: [{ id: 2, name: 'Mobile' }] })
    @IsArray()
    children: ProductMicroService.Category[];

    @ApiProperty({ description: '카테고리의 상품 목록', example: [{ id: 1, name: 'iPhone' }] })
    @IsArray()
    products: ProductMicroService.ProductResponse[];
}

export class CategoryListResponseDto implements ProductMicroService.CategoryListResponse {
    @ApiProperty({ description: '카테고리 목록', type: [CategoryResponseDto] })
    @IsArray()
    categories: CategoryResponseDto[];
}

export class CreateCategoryRequestDto extends OmitType(CategoryDto, ['id'] as const) {
    @ApiProperty({ description: '상위 카테고리 ID', example: 1 })
    @IsOptional()
    @IsNumber()
    parentId?: number;
}

export class UpdateCategoryRequestDto extends PartialType(CategoryDto) {
    @ApiProperty({ description: '상위 카테고리 ID', example: 1 })
    @IsOptional()
    @IsNumber()
    parentId?: number;
}
