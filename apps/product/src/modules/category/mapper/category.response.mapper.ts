import { ProductMicroService } from '@app/common';
import { ProductCategoryEntity } from '../../../entities/product.category.entity';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

export class CategoryResponseMapper {
    static toCategoryResponse(category: ProductCategoryEntity): ProductMicroService.CategoryResponse {
        if (!category) {
            throw new GrpcNotFoundException('Category not found');
        }

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            parent: {
                id: category.parent?.id,
                name: category.parent?.name,
                description: category.parent?.description,
            },
            children: category.children.map(child => ({
                id: child.id,
                name: child.name,
                description: child.description,
                parentId: child.parent?.id,
            })),
            products: category.products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
            })),
        };
    }
}
