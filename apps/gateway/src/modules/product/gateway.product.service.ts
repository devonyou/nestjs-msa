import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { createGrpcMetadata, ProductMicroService } from '@app/common';
import {
    CategoryListResponseDto,
    CategoryResponseDto,
    CreateCategoryRequestDto,
    UpdateCategoryRequestDto,
} from './dto/category.dto';
import { lastValueFrom } from 'rxjs';
import { throwHttpExceptionFromGrpcError } from '../../common/http/http.rpc.exception';
import {
    CreateProductRequestDto,
    GetProductListQueryDto,
    ProductListResponseDto,
    ProductResponseDto,
    UpdateProductRequestDto,
} from './dto/product.dto';
import { GeneratePresignedUrlRequestDto, GeneratePresignedUrlResponseDto } from './dto/presigned.url.dto';

@Injectable()
export class GatewayProductService implements OnModuleInit {
    private productService: ProductMicroService.ProductServiceClient;

    constructor(
        @Inject(ProductMicroService.PRODUCT_SERVICE_NAME)
        private readonly productMicroService: ClientGrpc,
    ) {}

    onModuleInit() {
        this.productService = this.productMicroService.getService<ProductMicroService.ProductServiceClient>(
            ProductMicroService.PRODUCT_SERVICE_NAME,
        );
    }

    async createProduct(dto: CreateProductRequestDto): Promise<ProductResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.createProduct.name);
            const stream = this.productService.createProduct({ ...dto }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async getProducts(dto: GetProductListQueryDto): Promise<ProductListResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.getProducts.name);
            const stream = this.productService.getProducts(dto, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async getProductById(id: number): Promise<ProductResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.getProductById.name);
            const stream = this.productService.getProductById({ id }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async updateProduct(id: number, dto: UpdateProductRequestDto): Promise<ProductResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.updateProduct.name);
            const stream = this.productService.updateProduct({ id, ...dto }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async deleteProduct(id: number): Promise<ProductMicroService.Empty> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.deleteProduct.name);
            const stream = this.productService.deleteProduct({ id }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async createCategory(dto: CreateCategoryRequestDto): Promise<any> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.createCategory.name);

            const stream = this.productService.createCategory({ ...dto }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async getCategories(): Promise<CategoryListResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.getCategories.name);
            const stream = this.productService.getAllCategories({}, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async getCategoryById(id: number): Promise<CategoryResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.getCategoryById.name);
            const stream = this.productService.getCategoryById({ id }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async updateCategory(id: number, body: UpdateCategoryRequestDto): Promise<CategoryResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.updateCategory.name);
            const stream = this.productService.updateCategory({ id, ...body }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async deleteCategory(id: number): Promise<ProductMicroService.Empty> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.deleteCategory.name);
            const stream = this.productService.deleteCategory({ id }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }

    async generatePresignedUrl(dto: GeneratePresignedUrlRequestDto): Promise<GeneratePresignedUrlResponseDto> {
        try {
            const metadata = createGrpcMetadata(GatewayProductService.name, this.generatePresignedUrl.name);
            const stream = this.productService.generatePresignedUrl({ contentType: dto.contentType }, metadata);
            const resp = await lastValueFrom(stream);
            return resp;
        } catch (error) {
            throwHttpExceptionFromGrpcError(error);
        }
    }
}
