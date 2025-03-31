import { ProductRepositoryPort } from './../port/output/product.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { ProductDomain } from '../domain/product.domain';

@Injectable()
export class CreateSampleProductUsecase {
    constructor(
        @Inject('ProductRepositoryPort')
        private readonly productRepositoryPort: ProductRepositoryPort,
    ) {}

    async execute() {
        const sample = [
            new ProductDomain({
                name: '사과',
                price: 1000,
                desc: '달디단 사과',
                stock: 2,
            }),
            new ProductDomain({
                name: '바나나',
                price: 1000,
                desc: '달디단 바나나',
                stock: 7,
            }),
            new ProductDomain({
                name: '메론',
                price: 1000,
                desc: '달디단 메론',
                stock: 5,
            }),
            new ProductDomain({
                name: '수박',
                price: 2000,
                desc: '달디단 수박',
                stock: 15,
            }),
        ];

        const result = await this.productRepositoryPort.createProduts(sample);
        return result;
    }
}
