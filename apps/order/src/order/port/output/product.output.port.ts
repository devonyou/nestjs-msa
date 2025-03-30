import { ProductDomain } from '../../domain/product.domain';

export interface ProductOutputPort {
    findManyProductsByIds(productIds: string[]): Promise<ProductDomain[]>;
}
