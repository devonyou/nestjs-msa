import { PRODUCT_SERVICE, ProductMicroService } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService implements OnModuleInit {
    private productService: ProductMicroService.ProductServiceClient;

    constructor(
        @Inject(PRODUCT_SERVICE)
        private readonly productMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.productService =
            this.productMicroService.getService('ProductService');
    }

    async createSampleProduct() {
        return await lastValueFrom(this.productService.createSample({}));
    }

    async findAllProduct() {
        return await lastValueFrom(this.productService.getProductsAll({}));
    }
}
