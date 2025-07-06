import { ProductMicroService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly categoryService: CategoryService,
    ) {}

    createProduct(request: ProductMicroService.CreateProductRequest): ProductMicroService.ProductResponse {
        return null;
    }

    deleteProduct(
        request: ProductMicroService.DeleteProductRequest,
    ):
        | ProductMicroService.Empty
        | Promise<ProductMicroService.Empty>
        | import('rxjs').Observable<ProductMicroService.Empty> {
        throw new Error('Method not implemented.');
    }
    updateProduct(
        request: ProductMicroService.UpdateProductRequest,
    ):
        | ProductMicroService.ProductResponse
        | Promise<ProductMicroService.ProductResponse>
        | import('rxjs').Observable<ProductMicroService.ProductResponse> {
        throw new Error('Method not implemented.');
    }
    getProductById(
        request: ProductMicroService.GetProductByIdRequest,
    ):
        | ProductMicroService.ProductResponse
        | Promise<ProductMicroService.ProductResponse>
        | import('rxjs').Observable<ProductMicroService.ProductResponse> {
        throw new Error('Method not implemented.');
    }
    getProducts(
        request: ProductMicroService.GetProductsRequest,
    ):
        | ProductMicroService.ProductListResponse
        | Promise<ProductMicroService.ProductListResponse>
        | import('rxjs').Observable<ProductMicroService.ProductListResponse> {
        throw new Error('Method not implemented.');
    }
}
