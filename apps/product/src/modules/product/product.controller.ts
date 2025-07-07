import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductMicroService } from '@app/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductResponseMapper } from './mapper/product.response.mapper';

@Controller()
export class ProductController
    implements
        Pick<
            ProductMicroService.ProductServiceController,
            'createProduct' | 'getProducts' | 'getProductById' | 'updateProduct' | 'deleteProduct'
        >
{
    constructor(private readonly productService: ProductService) {}

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'createProduct')
    async createProduct(
        request: ProductMicroService.CreateProductRequest,
    ): Promise<ProductMicroService.ProductResponse> {
        const response = await this.productService.createProduct(request);
        return ProductResponseMapper.toProductResponse(response);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'getProducts')
    async getProducts(
        request: ProductMicroService.GetProductsRequest,
    ): Promise<ProductMicroService.ProductListResponse> {
        const { products, total } = await this.productService.getProducts(request);
        return {
            products: products.map(product => ProductResponseMapper.toProductResponse(product)),
            total,
        };
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'getProductById')
    async getProductById(
        request: ProductMicroService.GetProductByIdRequest,
    ): Promise<ProductMicroService.ProductResponse> {
        const response = await this.productService.getProductById(request);
        return ProductResponseMapper.toProductResponse(response);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'updateProduct')
    async updateProduct(
        request: ProductMicroService.UpdateProductRequest,
    ): Promise<ProductMicroService.ProductResponse> {
        const response = await this.productService.updateProduct(request);
        return ProductResponseMapper.toProductResponse(response);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'deleteProduct')
    deleteProduct(request: ProductMicroService.DeleteProductRequest): Promise<ProductMicroService.Empty> {
        this.productService.deleteProduct(request.id);
        return null;
    }
}
