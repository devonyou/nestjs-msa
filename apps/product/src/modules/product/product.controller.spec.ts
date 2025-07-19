import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductMicroService } from '@app/common';
import { ProductResponseMapper } from './mapper/product.response.mapper';
import { TestBed } from '@automock/jest';
import { ProductEntity } from '../../entities/product.entity';

describe('ProductController', () => {
    let productController: ProductController;
    let productService: jest.Mocked<ProductService>;

    let mockProductResponse;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(ProductController).compile();

        productController = unit;
        productService = unitRef.get(ProductService);

        mockProductResponse = ProductResponseMapper.toProductResponse(new ProductEntity());

        jest.spyOn(ProductResponseMapper, 'toProductResponse').mockReturnValue(mockProductResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        const request: ProductMicroService.CreateProductRequest = {
            name: 'Product',
            description: 'Description',
            price: 0,
            categoryId: 0,
            images: [],
        };

        it('should create a product', async () => {
            const product = new ProductEntity();

            // mock
            jest.spyOn(productService, 'createProduct').mockResolvedValue(product);

            // expect
            const result = await productController.createProduct(request);
            expect(result).toEqual(mockProductResponse);
            expect(productService.createProduct).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(product);
        });
    });

    describe('getProducts', () => {
        const request: ProductMicroService.GetProductsRequest = {
            page: 0,
            limit: 0,
            sort: '',
        };

        it('should return all products', async () => {
            const mockProduct = new ProductEntity();

            // mock
            jest.spyOn(productService, 'getProducts').mockResolvedValue({
                products: [mockProduct],
                total: 1,
            });

            // expect
            const result = await productController.getProducts(request);
            expect(result).toEqual({ products: [mockProductResponse], total: 1 });
            expect(productService.getProducts).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('getProductById', () => {
        const request: ProductMicroService.GetProductByIdRequest = { id: 1 };

        it('should return a product by id', async () => {
            const mockProduct = new ProductEntity();

            // mock
            jest.spyOn(productService, 'getProductById').mockResolvedValue(mockProduct);

            // expect
            const result = await productController.getProductById(request);
            expect(result).toEqual(mockProductResponse);
            expect(productService.getProductById).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('getProductsByIds', () => {
        const request: ProductMicroService.GetProductsByIdsRequest = { ids: [1] };
        it('should return products by ids', async () => {
            const mockProduct = new ProductEntity();

            // mock
            jest.spyOn(productService, 'getProductsByIds').mockResolvedValue({
                products: [mockProduct],
                total: 1,
            });

            // expect
            const result = await productController.getProductsByIds(request);
            expect(result).toEqual({ products: [mockProductResponse], total: 1 });
            expect(productService.getProductsByIds).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('updateProduct', () => {
        const request: ProductMicroService.UpdateProductRequest = {
            id: 1,
            name: 'Product',
            description: 'Description',
            price: 0,
            categoryId: 0,
            images: [],
        };

        it('should update a product', async () => {
            const mockProduct = new ProductEntity();

            // mock
            jest.spyOn(productService, 'updateProduct').mockResolvedValue(mockProduct);

            // expect
            const result = await productController.updateProduct(request);
            expect(result).toEqual(mockProductResponse);
            expect(productService.updateProduct).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('deleteProduct', () => {
        const request: ProductMicroService.DeleteProductRequest = {
            id: 1,
        };

        it('should delete a product', async () => {
            // mock
            jest.spyOn(productService, 'deleteProduct').mockResolvedValue(null);

            // expect
            const result = await productController.deleteProduct(request);
            expect(result).toEqual(null);
            expect(productService.deleteProduct).toHaveBeenCalledWith(request.id);
        });
    });

    describe('generatePresignedUrl', () => {
        it('should generate a presigned url', async () => {
            const request: ProductMicroService.GeneratePresignedUrlRequest = {
                contentType: 'image/jpeg',
            };

            const response: ProductMicroService.GeneratePresignedUrlResponse = {
                presignedUrl: 'https://presigned-url.com',
                filename: 'image.jpeg',
                fileUrl: 'https://file-url.com',
                filePath: 'https://file-path.com',
            };

            // mock
            jest.spyOn(productService, 'generatePresignedUrl').mockResolvedValue(response);

            // expect
            const result = await productController.generatePresignedUrl(request);
            expect(result).toEqual(response);
            expect(productService.generatePresignedUrl).toHaveBeenCalledWith(request.contentType);
        });
    });
});
