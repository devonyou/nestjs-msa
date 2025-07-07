import { Controller } from '@nestjs/common';
import { ProductMicroService } from '@app/common';
import { CategoryService } from './category.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoryResponseMapper } from './mapper/category.response.mapper';

@Controller()
export class CategoryController
    implements
        Pick<
            ProductMicroService.ProductServiceController,
            'createCategory' | 'getAllCategories' | 'getCategoryById' | 'updateCategory' | 'deleteCategory'
        >
{
    constructor(private readonly categoryService: CategoryService) {}

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'createCategory')
    async createCategory(
        request: ProductMicroService.CreateCategoryRequest,
    ): Promise<ProductMicroService.CategoryResponse> {
        const response = await this.categoryService.createCategory(request);
        return CategoryResponseMapper.toCategoryResponse(response);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'getAllCategories')
    async getAllCategories(): Promise<ProductMicroService.CategoryListResponse> {
        const response = await this.categoryService.getAllCategories();
        return {
            categories: response.map(category => CategoryResponseMapper.toCategoryResponse(category)),
        };
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'getCategoryById')
    async getCategoryById(
        request: ProductMicroService.GetCategoryByIdRequest,
    ): Promise<ProductMicroService.CategoryResponse> {
        const response = await this.categoryService.getCategoryById(request.id);
        return CategoryResponseMapper.toCategoryResponse(response);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'updateCategory')
    async updateCategory(
        request: ProductMicroService.UpdateCategoryRequest,
    ): Promise<ProductMicroService.CategoryResponse> {
        const response = await this.categoryService.updateCategory(request);
        return CategoryResponseMapper.toCategoryResponse(response);
    }

    @GrpcMethod(ProductMicroService.PRODUCT_SERVICE_NAME, 'deleteCategory')
    deleteCategory(request: ProductMicroService.DeleteCategoryRequest): Promise<ProductMicroService.Empty> {
        this.categoryService.deleteCategory(request.id);
        return null;
    }
}
