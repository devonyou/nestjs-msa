import { ProductMicroService } from '@app/common';
import { ProductEntity } from '../../../domain/product.entity';

export class GetProductsInfoResponseMapper {
    constructor(
        private readonly response: ProductMicroService.GetProductsInfoResponse,
    ) {}

    toDomain(): ProductEntity[] {
        return this.response.products.map(p => {
            return new ProductEntity({
                productId: p.id,
                name: p.name,
                price: p.price,
            });
        });
    }
}
