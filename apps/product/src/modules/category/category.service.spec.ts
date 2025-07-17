import { CategoryService } from './category.service';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { ProductCategoryEntity } from '../../entities/product.category.entity';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { TestBed } from '@automock/jest';
import { getDataSourceToken } from '@nestjs/typeorm';

const parentCategory: ProductCategoryEntity = {
    id: 1,
    name: 'Parent',
    description: 'Parent category',
    parent: null,
    children: [],
    products: [],
} as ProductCategoryEntity;

const childCategory: ProductCategoryEntity = {
    id: 2,
    name: 'Child',
    description: 'Child category',
    parent: parentCategory,
    children: [],
    products: [],
} as ProductCategoryEntity;

describe('CategoryService', () => {
    let categoryService: CategoryService;
    let mockCategoryRepository: jest.Mocked<Repository<ProductCategoryEntity>>;
    let mockDataSource: jest.Mocked<DataSource>;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(CategoryService).compile();

        categoryService = unit;

        mockCategoryRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        } as unknown as jest.Mocked<Repository<ProductCategoryEntity>>;

        mockDataSource = unitRef.get(getDataSourceToken() as string);

        jest.spyOn(mockDataSource, 'getRepository').mockImplementation(entity => {
            if (entity === ProductCategoryEntity) return mockCategoryRepository;
            return null;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // createCategory
    describe('createCategory', () => {
        it('should create a category with parent', async () => {
            const request: ProductMicroService.CreateCategoryRequest = {
                name: 'Child',
                parentId: 1,
                description: 'Child category',
            };

            //mock
            jest.spyOn(mockCategoryRepository, 'findOne').mockResolvedValueOnce(parentCategory);
            jest.spyOn(mockCategoryRepository, 'create').mockReturnValue(childCategory);
            jest.spyOn(mockCategoryRepository, 'save').mockResolvedValue(childCategory);
            jest.spyOn(categoryService, 'getCategoryById').mockResolvedValue(childCategory);

            // expect
            const result = await categoryService.createCategory(request);
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockCategoryRepository.create).toHaveBeenCalledWith({
                name: 'Child',
                description: 'Child category',
                parent: parentCategory,
            });
            expect(mockCategoryRepository.save).toHaveBeenCalledWith(childCategory);
            expect(categoryService.getCategoryById).toHaveBeenCalledWith(childCategory.id);
            expect(result).toBe(childCategory);
        });

        it('should throw GrpcNotFoundException if parent category not found', async () => {
            const request: ProductMicroService.CreateCategoryRequest = {
                name: 'Child',
                parentId: 999,
                description: 'Child category',
            };

            // mock
            jest.spyOn(mockCategoryRepository, 'findOne').mockResolvedValueOnce(null);

            // expect
            await expect(categoryService.createCategory(request)).rejects.toThrow(GrpcNotFoundException);
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: request.parentId } });
        });

        it('should create a category without parent', async () => {
            const request: ProductMicroService.CreateCategoryRequest = {
                name: 'Root',
                description: 'Root category',
            };

            // mock
            jest.spyOn(mockCategoryRepository, 'create').mockReturnValue(parentCategory);
            jest.spyOn(mockCategoryRepository, 'save').mockResolvedValue(parentCategory);
            jest.spyOn(categoryService, 'getCategoryById').mockResolvedValue(parentCategory);

            // expect
            const result = await categoryService.createCategory(request);
            expect(mockCategoryRepository.create).toHaveBeenCalledWith({
                name: 'Root',
                description: 'Root category',
                parent: undefined,
            });
            expect(mockCategoryRepository.save).toHaveBeenCalledWith(parentCategory);
            expect(categoryService.getCategoryById).toHaveBeenCalledWith(parentCategory.id);
            expect(result).toBe(parentCategory);
        });
    });

    // getAllCategories
    describe('getAllCategories', () => {
        it('should return all categories', async () => {
            const categories = [parentCategory, childCategory];

            // mock
            jest.spyOn(mockCategoryRepository, 'find').mockResolvedValue(categories);

            // expect
            const result = await categoryService.getAllCategories();
            expect(mockCategoryRepository.find).toHaveBeenCalledWith({
                relations: ['parent', 'children', 'products'],
            });
            expect(result).toBe(categories);
        });
    });

    // getCategoryById
    describe('getCategoryById', () => {
        it('should return category with children and products', async () => {
            // mock

            jest.spyOn(mockCategoryRepository, 'createQueryBuilder').mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(parentCategory),
            } as unknown as SelectQueryBuilder<ProductCategoryEntity>);

            // expect
            const result = await categoryService.getCategoryById(1);
            expect(mockCategoryRepository.createQueryBuilder).toHaveBeenCalledWith('category');
            expect(mockCategoryRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith(
                'category.children',
                'child',
            );
            expect(mockCategoryRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith(
                'child.children',
                'grandchild',
            );
            expect(mockCategoryRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith(
                'category.products',
                'product',
            );
            expect(mockCategoryRepository.createQueryBuilder().where).toHaveBeenCalledWith('category.id = :id', {
                id: 1,
            });
            expect(mockCategoryRepository.createQueryBuilder().getOne).toHaveBeenCalled();
            expect(result).toBe(parentCategory);
        });
    });

    // updateCategory
    describe('updateCategory', () => {
        it('should update category with parent', async () => {
            const request: ProductMicroService.UpdateCategoryRequest = {
                id: 2,
                name: 'Updated Child',
                parentId: 1,
                description: 'Updated description',
            };

            // mock
            jest.spyOn(mockCategoryRepository, 'findOne')
                .mockResolvedValueOnce(parentCategory)
                .mockResolvedValueOnce(childCategory);
            jest.spyOn(mockCategoryRepository, 'save').mockResolvedValue(childCategory);
            jest.spyOn(categoryService, 'getCategoryById').mockResolvedValue(childCategory);

            // expect
            const result = await categoryService.updateCategory(request);
            expect(mockCategoryRepository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
            expect(mockCategoryRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: 2 } });
            expect(mockCategoryRepository.save).toHaveBeenCalledWith({
                ...childCategory,
                name: 'Updated Child',
                description: 'Updated description',
                parent: parentCategory,
            });
            expect(categoryService.getCategoryById).toHaveBeenCalledWith(2);
            expect(result).toBe(childCategory);
        });

        it('should throw GrpcNotFoundException if parent category not found', async () => {
            const request: ProductMicroService.UpdateCategoryRequest = {
                id: 2,
                name: 'Updated Child',
                parentId: 999,
                description: 'Updated description',
            };

            // mock
            jest.spyOn(mockCategoryRepository, 'findOne').mockResolvedValueOnce(null);

            // expect
            await expect(categoryService.updateCategory(request)).rejects.toThrow(GrpcNotFoundException);
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        });

        it('should throw GrpcNotFoundException if category not found', async () => {
            const request: ProductMicroService.UpdateCategoryRequest = {
                id: 999,
                name: 'Updated Child',
                parentId: 1,
                description: 'Updated description',
            };

            // mock
            jest.spyOn(mockCategoryRepository, 'findOne')
                .mockResolvedValueOnce(parentCategory)
                .mockResolvedValueOnce(null);

            // expect
            await expect(categoryService.updateCategory(request)).rejects.toThrow(GrpcNotFoundException);
            expect(mockCategoryRepository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
            expect(mockCategoryRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: 999 } });
        });
    });

    // deleteCategory
    describe('deleteCategory', () => {
        it('should delete category', async () => {
            // mock
            jest.spyOn(mockCategoryRepository, 'findOne').mockResolvedValueOnce(parentCategory);
            jest.spyOn(mockCategoryRepository, 'delete').mockResolvedValue(undefined);

            // expect
            await categoryService.deleteCategory(1);
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw GrpcNotFoundException if category not found', async () => {
            // mock
            jest.spyOn(mockCategoryRepository, 'findOne').mockResolvedValueOnce(null);

            // expect
            await expect(categoryService.deleteCategory(999)).rejects.toThrow(GrpcNotFoundException);
            expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        });
    });
});
