import { Inject, OnModuleInit } from '@nestjs/common';
import { ProductOutputPort } from '../../port/output/product.output.port';
import { PRODUCT_SERVICE, ProductMicroService } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ProductDomain } from '../../domain/product.domain';
import { lastValueFrom } from 'rxjs';
import { ProductResponseMapper } from '../../mapper/product.response.mapper';

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

    async findManyProductsByIds(
        productIds: string[],
    ): Promise<ProductDomain[]> {
        const resp = await lastValueFrom(
            this.productService.getProductsInfo({ productIds }),
        );
        const mapper = new ProductResponseMapper(resp);
        return mapper.toProductsDomain();
    }
}
