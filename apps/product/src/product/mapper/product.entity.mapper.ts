import { ProductEntity } from '../adapter/repository/entity/product.entity';
import { ProductDomain } from '../domain/product.domain';

export class ProductEntityMapper {
    constructor(private readonly productEntity: ProductEntity[]) {}

    toProductResponse(): ProductDomain[] {
        return this.productEntity.map(p => {
            const productDomain = new ProductDomain(p);
            productDomain.setId(p.id);
            return productDomain;
        });
    }
}
