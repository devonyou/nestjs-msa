import { ProductMicroService } from '@app/common';
import { ProductEntity } from '../../../entities/product.entity';
import { CategoryResponseMapper } from '../../category/mapper/category.response.mapper';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { StockResponseMapper } from '../../stock/mapper/stock.response.mapper';

export class ProductResponseMapper {
    static toProductResponse(product: ProductEntity): ProductMicroService.ProductResponse {
        if (!product) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }

        return {
            ...product,
            category: product.category && CategoryResponseMapper.toCategoryResponse(product.category),
            createdAt: product.createdAt?.toISOString(),
            updatedAt: product.updatedAt?.toISOString(),
            stock: product.stock && StockResponseMapper.toStockResponse(product.stock),
        };
    }
}
