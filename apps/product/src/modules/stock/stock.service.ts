import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStockEntity } from '../../entities/product.stock.entity';
import { ProductService } from '../product/product.service';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(ProductStockEntity)
        private readonly productStockEntity: Repository<ProductStockEntity>,
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
    ) {}

    getStockByProductId(request: ProductMicroService.GetStockByProductIdRequest): Promise<ProductStockEntity> {
        return this.productStockEntity.findOne({
            where: {
                product: {
                    id: request.productId,
                },
            },
            relations: ['product'],
        });
    }

    async upsertStock(request: ProductMicroService.UpsertStockQuantityRequest): Promise<ProductStockEntity> {
        const product = await this.productService.getProductById({ id: request.productId });

        if (!product) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }

        await this.productStockEntity.upsert(
            {
                product: product,
                quantity: request.quantity,
            },
            {
                conflictPaths: ['product'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        return await this.getStockByProductId({ productId: request.productId });
    }
}
