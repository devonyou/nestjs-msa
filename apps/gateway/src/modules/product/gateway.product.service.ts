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
}
