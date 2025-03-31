import { ProductDomain } from '../../domain/product.domain';

export interface ProductRepositoryPort {
    createProduts(sample: ProductDomain[]): Promise<ProductDomain[]>;

    findManyProductByIds(productIds: string[]): Promise<ProductDomain[]>;

    findAllProduct(): Promise<ProductDomain[]>;
}
