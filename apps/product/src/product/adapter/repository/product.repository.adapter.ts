import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entity/product.entity';
import { In, Repository } from 'typeorm';
import { ProductRepositoryPort } from '../../port/output/product.repository.port';
import { ProductDomain } from '../../domain/product.domain';
import { ProductEntityMapper } from '../../mapper/product.entity.mapper';

export class ProductRepositoryAdapter implements ProductRepositoryPort {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) {}

    async createProduts(sample: ProductDomain[]): Promise<ProductDomain[]> {
        const products = await this.productRepository
            .createQueryBuilder()
            .insert()
            .into(ProductEntity)
            .values(sample)
            .execute();
        const productIds = products.identifiers.map(v => v.id);
        return this.findManyProductByIds(productIds);
    }

    async findManyProductByIds(productIds: string[]): Promise<ProductDomain[]> {
        const products = await this.productRepository.find({
            where: { id: In(productIds) },
        });
        return new ProductEntityMapper(products).toProductResponse();
    }

    async findAllProduct(): Promise<ProductDomain[]> {
        const products = await this.productRepository.find();
        return new ProductEntityMapper(products).toProductResponse();
    }
}
