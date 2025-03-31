import { Inject, Injectable } from '@nestjs/common';
import { ProductDomain } from '../domain/product.domain';
import { ProductRepositoryPort } from '../port/output/product.repository.port';

@Injectable()
export class FindProductUsecase {
    constructor(
        @Inject('ProductRepositoryPort')
        private readonly productRepositoryPort: ProductRepositoryPort,
    ) {}

    findManyProductByIds(productIds: string[]): Promise<ProductDomain[]> {
        return this.productRepositoryPort.findManyProductByIds(productIds);
    }

    findAllProduct() {
        return this.productRepositoryPort.findAllProduct();
    }
}
