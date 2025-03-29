import { Inject, OnModuleInit } from '@nestjs/common';
import { ProductOutputPort } from '../../port/output/product.output.port';
import { ProductEntity } from '../../domain/product.entity';
import { ClientGrpc } from '@nestjs/microservices';
import { PRODUCT_SERVICE, ProductMicroService } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { GetProductsInfoResponseMapper } from './mapper/get.products.info.response.mapper';

export class ProductGrpc implements ProductOutputPort, OnModuleInit {
    productService: ProductMicroService.ProductServiceClient;

    constructor(
        @Inject(PRODUCT_SERVICE)
        private readonly productMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.productService =
            this.productMicroService.getService<ProductMicroService.ProductServiceClient>(
                'ProductService',
            );
    }

    async getProductsByIds(productIds: string[]): Promise<ProductEntity[]> {
        const resp = await lastValueFrom(
            this.productService.getProductsInfo({ productIds }),
        );

        return new GetProductsInfoResponseMapper(resp).toDomain();
    }
}
