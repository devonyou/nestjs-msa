import { ProductMicroService } from '@app/common';
import { ProductCategoryEntity } from '../../../entities/product.category.entity';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { ProductResponseMapper } from '../../product/mapper/product.response.mapper';

export class CategoryResponseMapper {
    static toCategoryResponse(category: ProductCategoryEntity): ProductMicroService.CategoryResponse {
        if (!category) {
            throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
        }

        try {
            return {
                ...category,
                parent: category.parent && CategoryResponseMapper.toCategoryResponse(category?.parent),
                products: category.products?.map(product => ProductResponseMapper.toProductResponse(product)),
            };
        } catch (error) {
            throw new GrpcInternalException('');
        }
    }
}
