import { TestBed } from '@automock/jest';
import { ProductService } from './product.service';
import { ProductEntity } from '../../entities/product.entity';
import { ProductCategoryEntity } from '../../entities/product.category.entity';
import { ProductImageEntity } from '../../entities/product.image.entity';
import { ProductStockEntity } from '../../entities/product.stock.entity';
import { DataSource, ILike, In, QueryRunner, Repository } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { CategoryService } from '../category/category.service';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

describe('ProductService', () => {
    let productService: ProductService;

    let mockDataSource: jest.Mocked<DataSource>;
    // let mockConfigService: jest.Mocked<ConfigService>;
    let mockCategoryService: jest.Mocked<CategoryService>;
    // let mockS3Service: jest.Mocked<S3Service>;
    let mockQueryRunner: jest.Mocked<QueryRunner>;

    let mockCateRepo: jest.Mocked<Repository<ProductCategoryEntity>>;
    let mockProductRepo: jest.Mocked<Repository<ProductEntity>>;
    let mockImagerepo: jest.Mocked<Repository<ProductImageEntity>>;
    let mockStockRepo: jest.Mocked<Repository<ProductStockEntity>>;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(ProductService).compile();

        productService = unit;

        mockDataSource = unitRef.get(getDataSourceToken() as string);
        mockCategoryService = unitRef.get(CategoryService);
        // mockConfigService = unitRef.get(ConfigService);
        // mockS3Service = unitRef.get(S3Service);

        mockCateRepo = {
            findOne: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductCategoryEntity>>;

        mockProductRepo = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductEntity>>;

        mockImagerepo = {
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductImageEntity>>;

        mockStockRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductStockEntity>>;

        const mockQrManager = {
            getRepository: jest.fn().mockImplementation(entity => {
                if (entity === ProductCategoryEntity) return mockCateRepo;
                if (entity === ProductEntity) return mockProductRepo;
                if (entity === ProductImageEntity) return mockImagerepo;
                if (entity === ProductStockEntity) return mockStockRepo;
                return null;
            }),
        };

        mockQueryRunner = {
            connect: jest.fn().mockResolvedValue(undefined),
            startTransaction: jest.fn().mockResolvedValue(undefined),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined),
            manager: mockQrManager,
        } as any;

        jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

        jest.spyOn(mockDataSource, 'getRepository').mockImplementation(entity => {
            if (entity === ProductCategoryEntity) return mockCateRepo;
            if (entity === ProductEntity) return mockProductRepo;
            if (entity === ProductImageEntity) return mockImagerepo;
            if (entity === ProductStockEntity) return mockStockRepo;
            return null;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        const request: ProductMicroService.CreateProductRequest = {
            name: 'Product',
            description: 'Desc',
            price: 1000,
            categoryId: 1,
            images: [],
        };

        it('should create product successfully', async () => {
            const category: ProductCategoryEntity = {
                id: 1,
                name: 'Category',
                description: 'desc',
                children: [],
                products: [],
            };

            const productEntity: ProductEntity = {
                ...request,
                id: 10,
                category,
                images: [],
                stock: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const savedProduct: ProductEntity = {
                ...productEntity,
            };

            // mock
            jest.spyOn(mockCateRepo, 'findOne').mockResolvedValue(category);
            jest.spyOn(mockProductRepo, 'create').mockReturnValue(productEntity);
            jest.spyOn(mockProductRepo, 'save').mockResolvedValue(productEntity);
            jest.spyOn(mockProductRepo, 'findOne').mockResolvedValue(savedProduct);
            jest.spyOn(productService as any, 'upsertProductImage').mockResolvedValue(undefined);

            const result = await productService.createProduct(request);

            // expect
            expect(mockDataSource.createQueryRunner).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockCateRepo.findOne).toHaveBeenCalledWith({ where: { id: request.categoryId } });
            expect(mockProductRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: request.name,
                    description: request.description,
                    price: request.price,
                    category: { id: category.id },
                }),
            );
            expect(mockProductRepo.save).toHaveBeenCalledWith(productEntity);
            expect(productService['upsertProductImage']).toHaveBeenCalledWith(mockQueryRunner, productEntity.id, []); // private 메서드 접근
            expect(mockProductRepo.findOne).toHaveBeenCalledWith({
                where: { id: productEntity.id },
                relations: ['category', 'images', 'stock'],
            });
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedProduct);
        });

        it('should throw an error if the category is not found', async () => {
            // mock
            mockCateRepo.findOne.mockResolvedValue(null);

            // expect
            await expect(productService.createProduct(request)).rejects.toThrow(GrpcNotFoundException);
            expect(mockDataSource.createQueryRunner).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);

            expect(mockProductRepo.save).not.toHaveBeenCalled();
            expect(mockProductRepo.findOne).not.toHaveBeenCalled();
        });
    });

    describe('getProducts', () => {
        it('should return a list of products with total count', async () => {
            const request: ProductMicroService.GetProductsRequest = {
                page: 1,
                limit: 10,
                sort: 'createdAt_DESC',
                categoryId: 1,
                name: 'Product',
            };

            const products: ProductEntity[] = [
                {
                    id: 1,
                    name: 'Product 1',
                    description: 'Description 1',
                    price: 1000,
                    category: { id: 1, name: 'Category 1', description: 'desc', children: [], products: [] },
                    images: [],
                    stock: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const total = 1;

            // mock
            jest.spyOn(mockProductRepo, 'findAndCount').mockResolvedValue([products, total]);

            const result = await productService.getProducts(request);

            // expect
            expect(mockProductRepo.findAndCount).toHaveBeenCalledWith({
                where: {
                    category: { id: request.categoryId },
                    name: ILike(`%${request.name}%`),
                },
                order: { createdAt: 'DESC' },
                skip: (request.page - 1) * request.limit,
                take: request.limit,
                relations: ['category', 'images', 'stock'],
            });
            expect(result).toEqual({ products, total });
        });
    });

    describe('getProductById', () => {
        it('should return a product by id', async () => {
            const request: ProductMicroService.GetProductByIdRequest = {
                id: 1,
            };

            const product: ProductEntity = {
                id: 1,
                name: 'Product',
                description: 'Description',
                price: 0,
                category: new ProductCategoryEntity(),
                images: [],
                stock: new ProductStockEntity(),
                createdAt: undefined,
                updatedAt: undefined,
            };

            // mock
            jest.spyOn(mockProductRepo, 'findOne').mockResolvedValue(product);

            const result = await productService.getProductById(request);

            // expect
            expect(mockProductRepo.findOne).toHaveBeenCalledWith({
                where: { id: request.id },
                relations: ['category', 'images', 'stock'],
            });
            expect(result).toEqual(product);
        });
    });

    describe('getProductsByIds', () => {
        it('should return a list of products by ids', async () => {
            const request: ProductMicroService.GetProductsByIdsRequest = {
                ids: [1, 2, 3],
            };

            const products: ProductEntity[] = [
                {
                    id: 1,
                    name: 'Product 1',
                    description: 'Description 1',
                    price: 1000,
                    category: new ProductCategoryEntity(),
                    images: [],
                    stock: new ProductStockEntity(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const total = 1;

            // mock
            jest.spyOn(mockProductRepo, 'findAndCount').mockResolvedValue([products, total]);

            const result = await productService.getProductsByIds(request);

            // expect
            expect(mockProductRepo.findAndCount).toHaveBeenCalledWith({
                where: { id: In(request.ids) },
            });
            expect(result).toEqual({ products, total });
        });
    });

    describe('updateProduct', () => {
        const request: ProductMicroService.UpdateProductRequest = {
            id: 1,
            name: 'Product',
            description: 'Description',
            price: 1000,
            categoryId: 1,
            images: [],
        };

        const product: ProductEntity = {
            id: 1,
            name: 'Product',
            description: 'Description',
            price: 1000,
            category: new ProductCategoryEntity(),
            images: [],
            stock: new ProductStockEntity(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should update a product', async () => {
            // mock
            jest.spyOn(mockProductRepo, 'findOne').mockResolvedValueOnce(product).mockResolvedValueOnce(product);
            jest.spyOn(mockCategoryService, 'getCategoryById').mockResolvedValue(product.category);
            jest.spyOn(mockProductRepo, 'save').mockResolvedValue(product);
            jest.spyOn(productService, 'upsertProductImage').mockResolvedValue(undefined);

            const result = await productService.updateProduct(request);

            // expect
            expect(mockProductRepo.findOne).toHaveBeenCalledWith({
                where: { id: request.id },
                relations: ['category', 'images', 'stock'],
            });
            expect(result).toEqual(product);
        });

        it('should throw an error if the product is not found', async () => {
            // mock
            jest.spyOn(mockProductRepo, 'findOne').mockResolvedValue(null);

            // expect
            await expect(productService.updateProduct(request)).rejects.toThrow(GrpcNotFoundException);
        });

        it('should throw an error if the category is not found', async () => {
            // mock
            jest.spyOn(mockProductRepo, 'findOne').mockResolvedValue(product);
            jest.spyOn(mockCategoryService, 'getCategoryById').mockResolvedValue(null);

            // expect
            await expect(productService.updateProduct(request)).rejects.toThrow(GrpcNotFoundException);
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product', async () => {
            const request: ProductMicroService.DeleteProductRequest = {
                id: 1,
            };

            // mock
            jest.spyOn(mockProductRepo, 'delete').mockResolvedValue(undefined);

            const result = await productService.deleteProduct(request.id);

            // expect
            expect(mockProductRepo.delete).toHaveBeenCalledWith(request.id);
            expect(result).toEqual(undefined);
        });
    });

    describe('upsertProductImage', () => {
        it('should upsert product image', async () => {
            const productImage: ProductImageEntity = {
                id: 1,
                url: 'https://example.com',
                main: false,
                product: new ProductEntity(),
            };

            // mock
            jest.spyOn(mockImagerepo, 'delete').mockResolvedValue(undefined);
            jest.spyOn(mockImagerepo, 'create').mockReturnValue(productImage);
            jest.spyOn(mockImagerepo, 'save').mockResolvedValue(productImage);

            const result = await productService.upsertProductImage(mockQueryRunner, productImage.product.id, [
                { url: productImage.url, main: productImage.main },
            ]);

            // expect
            expect(mockImagerepo.create).toHaveBeenCalledWith({
                url: productImage.url,
                main: productImage.main,
                product: { id: productImage.product.id },
            });
            expect(mockImagerepo.save).toHaveBeenCalledWith(productImage);
            expect(result).toEqual([productImage]);
        });

        it('should return empty array if images is empty', async () => {
            const result = await productService.upsertProductImage(mockQueryRunner, 1, []);
            expect(result).toEqual([]);
        });
    });
});
