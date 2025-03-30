import { ProductMicroService } from '@app/common';
import { ProductDomain } from '../domain/product.domain';

export class ProductResponseMapper {
    constructor(
        private readonly response: ProductMicroService.GetProductsInfoResponse,
    ) {}

    toProductsDomain(): ProductDomain[] {
        return this.response.products.map(p => {
            return new ProductDomain({
                productId: p.id,
                name: p.name,
                price: p.price,
            });
        });
    }
}
