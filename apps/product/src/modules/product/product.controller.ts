import { Controller } from '@nestjs/common';
import { ProductMicroService } from '@app/common';
import { Observable } from 'rxjs';
import { ProductService } from './product.service';
import { CategoryService } from '../category/category.service';

@Controller()
@ProductMicroService.ProductServiceControllerMethods()
export class ProductController implements ProductMicroService.ProductServiceController {
    constructor(
        private readonly productService: ProductService,
        private readonly categoryService: CategoryService,
    ) {}

    // product
    createProduct(
        request: ProductMicroService.CreateProductRequest,
    ):
        | Promise<ProductMicroService.ProductResponse>
        | Observable<ProductMicroService.ProductResponse>
        | ProductMicroService.ProductResponse {
        return this.productService.createProduct(request);
    }

    getProducts(
        request: ProductMicroService.GetProductsRequest,
    ):
        | Promise<ProductMicroService.ProductListResponse>
        | Observable<ProductMicroService.ProductListResponse>
        | ProductMicroService.ProductListResponse {
        return this.productService.getProducts(request);
    }

    getProductById(
        request: ProductMicroService.GetProductByIdRequest,
    ):
        | Promise<ProductMicroService.ProductResponse>
        | Observable<ProductMicroService.ProductResponse>
        | ProductMicroService.ProductResponse {
        return this.productService.getProductById(request);
    }

    updateProduct(
        request: ProductMicroService.UpdateProductRequest,
    ):
        | Promise<ProductMicroService.ProductResponse>
        | Observable<ProductMicroService.ProductResponse>
        | ProductMicroService.ProductResponse {
        return this.productService.updateProduct(request);
    }

    deleteProduct(
        request: ProductMicroService.DeleteProductRequest,
    ): Promise<ProductMicroService.Empty> | Observable<ProductMicroService.Empty> | ProductMicroService.Empty {
        return this.productService.deleteProduct(request);
    }

    searchProducts(
        request: ProductMicroService.SearchProductsRequest,
    ):
        | Promise<ProductMicroService.ProductListResponse>
        | Observable<ProductMicroService.ProductListResponse>
        | ProductMicroService.ProductListResponse {
        throw new Error('Method not implemented.');
    }

    // category
    createCategory(
        request: ProductMicroService.CreateCategoryRequest,
    ):
        | Promise<ProductMicroService.CategoryResponse>
        | Observable<ProductMicroService.CategoryResponse>
        | ProductMicroService.CategoryResponse {
        return this.categoryService.createCategory(request);
    }

    getAllCategories(
        request: ProductMicroService.Empty,
    ):
        | Promise<ProductMicroService.CategoryListResponse>
        | Observable<ProductMicroService.CategoryListResponse>
        | ProductMicroService.CategoryListResponse {
        return this.categoryService.getAllCategories(request);
    }

    getCategoryById(
        request: ProductMicroService.GetCategoryByIdRequest,
    ):
        | Promise<ProductMicroService.CategoryResponse>
        | Observable<ProductMicroService.CategoryResponse>
        | ProductMicroService.CategoryResponse {
        return this.categoryService.getCategoryById(request.id);
    }

    updateCategory(
        request: ProductMicroService.UpdateCategoryRequest,
    ):
        | Promise<ProductMicroService.CategoryResponse>
        | Observable<ProductMicroService.CategoryResponse>
        | ProductMicroService.CategoryResponse {
        return this.categoryService.updateCategory(request);
    }

    deleteCategory(
        request: ProductMicroService.DeleteCategoryRequest,
    ): Promise<ProductMicroService.Empty> | Observable<ProductMicroService.Empty> | ProductMicroService.Empty {
        return this.categoryService.deleteCategory(request.id);
    }

    // option
    addOptionToProduct(
        request: ProductMicroService.AddOptionToProductRequest,
    ):
        | Promise<ProductMicroService.ProductOptionResponse>
        | Observable<ProductMicroService.ProductOptionResponse>
        | ProductMicroService.ProductOptionResponse {
        throw new Error('Method not implemented.');
    }
    getProductOptions(
        request: ProductMicroService.GetProductOptionsRequest,
    ):
        | Promise<ProductMicroService.ProductOptionListResponse>
        | Observable<ProductMicroService.ProductOptionListResponse>
        | ProductMicroService.ProductOptionListResponse {
        throw new Error('Method not implemented.');
    }
    updateOption(
        request: ProductMicroService.UpdateOptionRequest,
    ):
        | Promise<ProductMicroService.ProductOptionResponse>
        | Observable<ProductMicroService.ProductOptionResponse>
        | ProductMicroService.ProductOptionResponse {
        throw new Error('Method not implemented.');
    }
    deleteOption(
        request: ProductMicroService.DeleteOptionRequest,
    ): Promise<ProductMicroService.Empty> | Observable<ProductMicroService.Empty> | ProductMicroService.Empty {
        throw new Error('Method not implemented.');
    }
    addImagesToProduct(
        request: ProductMicroService.AddImagesToProductRequest,
    ):
        | Promise<ProductMicroService.ProductImageListResponse>
        | Observable<ProductMicroService.ProductImageListResponse>
        | ProductMicroService.ProductImageListResponse {
        throw new Error('Method not implemented.');
    }
    getProductImages(
        request: ProductMicroService.GetProductImagesRequest,
    ):
        | Promise<ProductMicroService.ProductImageListResponse>
        | Observable<ProductMicroService.ProductImageListResponse>
        | ProductMicroService.ProductImageListResponse {
        throw new Error('Method not implemented.');
    }
    deleteImage(
        request: ProductMicroService.DeleteImageRequest,
    ): Promise<ProductMicroService.Empty> | Observable<ProductMicroService.Empty> | ProductMicroService.Empty {
        throw new Error('Method not implemented.');
    }
    setMainImage(
        request: ProductMicroService.SetMainImageRequest,
    ):
        | Promise<ProductMicroService.ProductImageResponse>
        | Observable<ProductMicroService.ProductImageResponse>
        | ProductMicroService.ProductImageResponse {
        throw new Error('Method not implemented.');
    }
    getInventoryByProductId(
        request: ProductMicroService.GetInventoryByProductIdRequest,
    ):
        | Promise<ProductMicroService.InventoryResponse>
        | Observable<ProductMicroService.InventoryResponse>
        | ProductMicroService.InventoryResponse {
        throw new Error('Method not implemented.');
    }
    getInventoryByOptionId(
        request: ProductMicroService.GetInventoryByOptionIdRequest,
    ):
        | Promise<ProductMicroService.InventoryResponse>
        | Observable<ProductMicroService.InventoryResponse>
        | ProductMicroService.InventoryResponse {
        throw new Error('Method not implemented.');
    }
    increaseInventory(
        request: ProductMicroService.UpdateInventoryQuantityRequest,
    ):
        | Promise<ProductMicroService.InventoryResponse>
        | Observable<ProductMicroService.InventoryResponse>
        | ProductMicroService.InventoryResponse {
        throw new Error('Method not implemented.');
    }
    decreaseInventory(
        request: ProductMicroService.UpdateInventoryQuantityRequest,
    ):
        | Promise<ProductMicroService.InventoryResponse>
        | Observable<ProductMicroService.InventoryResponse>
        | ProductMicroService.InventoryResponse {
        throw new Error('Method not implemented.');
    }
    getInventoryLogs(
        request: ProductMicroService.GetInventoryLogsRequest,
    ):
        | Promise<ProductMicroService.InventoryLogListResponse>
        | Observable<ProductMicroService.InventoryLogListResponse>
        | ProductMicroService.InventoryLogListResponse {
        throw new Error('Method not implemented.');
    }
    createStockReservation(
        request: ProductMicroService.CreateStockReservationRequest,
    ):
        | Promise<ProductMicroService.StockReservationResponse>
        | Observable<ProductMicroService.StockReservationResponse>
        | ProductMicroService.StockReservationResponse {
        throw new Error('Method not implemented.');
    }
    releaseStockReservation(
        request: ProductMicroService.ReleaseStockReservationRequest,
    ): Promise<ProductMicroService.Empty> | Observable<ProductMicroService.Empty> | ProductMicroService.Empty {
        throw new Error('Method not implemented.');
    }
    confirmStockReservation(
        request: ProductMicroService.ConfirmStockReservationRequest,
    ):
        | Promise<ProductMicroService.InventoryResponse>
        | Observable<ProductMicroService.InventoryResponse>
        | ProductMicroService.InventoryResponse {
        throw new Error('Method not implemented.');
    }
}
