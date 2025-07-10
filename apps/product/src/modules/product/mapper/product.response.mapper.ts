import { ProductMicroService } from '@app/common';
import { ProductEntity } from '../../../entities/product.entity';
import { CategoryResponseMapper } from '../../category/mapper/category.response.mapper';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { StockResponseMapper } from '../../stock/mapper/stock.response.mapper';

export class ProductResponseMapper {
    static toProductResponse(product: ProductEntity): ProductMicroService.ProductResponse {
        if (!product) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }

        try {
            return {
                ...product,
                category: product.category && CategoryResponseMapper.toCategoryResponse(product.category),
                stock: product.stock && StockResponseMapper.toStockResponse(product.stock),
                createdAt: product.createdAt && new Date(product.createdAt).toISOString(),
                updatedAt: product.updatedAt && new Date(product.updatedAt).toISOString(),
            };
        } catch (error) {
            throw new GrpcInternalException('');
        }
    }
}
