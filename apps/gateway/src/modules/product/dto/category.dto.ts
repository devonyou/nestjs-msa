import { ProductMicroService } from '@app/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CategoryDto implements ProductMicroService.Category {
    @ApiProperty({ description: 'The id of the category', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'The name of the category', example: 'Electronics' })
    @IsString()
    @IsNotEmpty({ message: 'name is required' })
    name: string;

    @ApiProperty({ description: 'The description of the category', example: 'Electronics category' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class CategoryResponseDto implements ProductMicroService.CategoryResponse {
    @ApiProperty({ description: 'The id of the category', example: 1 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'The name of the category', example: 'Electronics' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'The description of the category', example: 'Electronics category' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'The parent of the category', example: { id: 1, name: 'Electronics' } })
    @IsOptional()
    parent?: ProductMicroService.Category;

    @ApiProperty({ description: 'The children of the category', example: [{ id: 2, name: 'Mobile' }] })
    @IsArray()
    children: ProductMicroService.Category[];

    @ApiProperty({ description: 'The products of the category', example: [{ id: 1, name: 'iPhone' }] })
    @IsArray()
    products: ProductMicroService.ProductResponse[];
}

export class CategoryListResponseDto implements ProductMicroService.CategoryListResponse {
    @ApiProperty({ description: 'The categories', type: [CategoryResponseDto] })
    @IsArray()
    categories: CategoryResponseDto[];
}

export class CreateCategoryRequestDto extends OmitType(CategoryDto, ['id'] as const) {
    @ApiProperty({ description: 'The parent id of the category', example: 1 })
    @IsOptional()
    @IsNumber()
    parentId?: number;
}

export class UpdateCategoryRequestDto extends PartialType(CategoryDto) {
    @ApiProperty({ description: 'The parent id of the category', example: 1 })
    @IsOptional()
    @IsNumber()
    parentId?: number;
}
