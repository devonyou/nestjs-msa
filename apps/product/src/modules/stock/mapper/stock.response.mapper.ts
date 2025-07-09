import { ProductMicroService } from '@app/common';
import { ProductStockEntity } from 'apps/product/src/entities/product.stock.entity';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { ProductResponseMapper } from '../../product/mapper/product.response.mapper';

export class StockResponseMapper {
    static toStockResponse(stock: ProductStockEntity): ProductMicroService.StockResponse {
        if (!stock) {
            throw new GrpcNotFoundException('재고정보를 찾을 수 없습니다');
        }

        try {
            return {
                ...stock,
                product: stock.product && ProductResponseMapper.toProductResponse(stock.product),
            };
        } catch (error) {
            throw new GrpcInternalException('');
        }
    }
}
