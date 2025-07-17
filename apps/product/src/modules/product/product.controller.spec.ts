import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductMicroService } from '@app/common';
import { ProductResponseMapper } from './mapper/product.response.mapper';

const mockProductService = {
    createProduct: jest.fn(),
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    getProductsByIds: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    generatePresignedUrl: jest.fn(),
};

describe('ProductController', () => {
    let productController: ProductController;

    const mockProduct: ProductMicroService.ProductResponse = {
        id: 1,
        name: 'Product',
        description: 'Description',
        price: 0,
        images: [],
        category: undefined,
        stock: undefined,
        createdAt: '',
        updatedAt: '',
    };

    const mockProductResponse: ProductMicroService.ProductResponse = {
        id: 1,
        name: 'Product',
        description: 'Description',
        price: 0,
        images: [],
        category: undefined,
        stock: undefined,
        createdAt: '',
        updatedAt: '',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                {
                    provide: ProductService,
                    useValue: mockProductService,
                },
            ],
        }).compile();

        productController = module.get<ProductController>(ProductController);

        jest.spyOn(ProductResponseMapper, 'toProductResponse').mockReturnValue(mockProductResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        it('should create a product', async () => {
            const request: ProductMicroService.CreateProductRequest = {
                name: 'Product',
                description: 'Description',
                price: 0,
                categoryId: 0,
                images: [],
            };

            // mock
            jest.spyOn(mockProductService, 'createProduct').mockResolvedValue(mockProduct);

            // expect
            const result = await productController.createProduct(request);
            expect(result).toEqual(mockProductResponse);
            expect(mockProductService.createProduct).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('getProducts', () => {
        it('should return all products', async () => {
            const request: ProductMicroService.GetProductsRequest = {
                page: 0,
                limit: 0,
                sort: '',
            };

            // mock
            jest.spyOn(mockProductService, 'getProducts').mockResolvedValue({
                products: [mockProduct],
                total: 1,
            });

            // expect
            const result = await productController.getProducts(request);
            expect(result).toEqual({ products: [mockProductResponse], total: 1 });
            expect(mockProductService.getProducts).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('getProductById', () => {
        it('should return a product by id', async () => {
            const request: ProductMicroService.GetProductByIdRequest = { id: 1 };

            // mock
            jest.spyOn(mockProductService, 'getProductById').mockResolvedValue(mockProduct);

            // expect
            const result = await productController.getProductById(request);
            expect(result).toEqual(mockProductResponse);
            expect(mockProductService.getProductById).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('getProductsByIds', () => {
        it('should return products by ids', async () => {
            const request: ProductMicroService.GetProductsByIdsRequest = { ids: [1] };

            // mock
            jest.spyOn(mockProductService, 'getProductsByIds').mockResolvedValue({
                products: [mockProduct],
                total: 1,
            });

            // expect
            const result = await productController.getProductsByIds(request);
            expect(result).toEqual({ products: [mockProductResponse], total: 1 });
            expect(mockProductService.getProductsByIds).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('updateProduct', () => {
        it('should update a product', async () => {
            const request: ProductMicroService.UpdateProductRequest = {
                id: 1,
                name: 'Product',
                description: 'Description',
                price: 0,
                categoryId: 0,
                images: [],
            };

            // mock
            jest.spyOn(mockProductService, 'updateProduct').mockResolvedValue(mockProduct);

            // expect
            const result = await productController.updateProduct(request);
            expect(result).toEqual(mockProductResponse);
            expect(mockProductService.updateProduct).toHaveBeenCalledWith(request);
            expect(ProductResponseMapper.toProductResponse).toHaveBeenCalledWith(mockProduct);
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product', async () => {
            const request: ProductMicroService.DeleteProductRequest = {
                id: 1,
            };

            // mock
            jest.spyOn(mockProductService, 'deleteProduct').mockResolvedValue(null);

            // expect
            const result = await productController.deleteProduct(request);
            expect(result).toEqual(null);
            expect(mockProductService.deleteProduct).toHaveBeenCalledWith(request.id);
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
            jest.spyOn(mockProductService, 'generatePresignedUrl').mockResolvedValue(response);

            // expect
            const result = await productController.generatePresignedUrl(request);
            expect(result).toEqual(response);
            expect(mockProductService.generatePresignedUrl).toHaveBeenCalledWith(request.contentType);
        });
    });
});
