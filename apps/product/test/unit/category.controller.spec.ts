import { ProductCategoryEntity } from '../../src/entities/product.category.entity';
import { CategoryController } from '../../src/modules/category/category.controller';
import { CategoryService } from '../../src/modules/category/category.service';
import { CategoryResponseMapper } from '../../src/modules/category/mapper/category.response.mapper';
import { ProductMicroService } from '@app/common';
import { TestBed } from '@automock/jest';

describe('CategoryController', () => {
    let categoryController: CategoryController;
    let categoryService: jest.Mocked<CategoryService>;
    let mockCategoryResponse;

    beforeEach(async () => {
        const { unit, unitRef } = TestBed.create(CategoryController).compile();

        categoryController = unit;
        categoryService = unitRef.get(CategoryService);

        mockCategoryResponse = CategoryResponseMapper.toCategoryResponse(new ProductCategoryEntity());

        jest.spyOn(CategoryResponseMapper, 'toCategoryResponse').mockReturnValue(mockCategoryResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // createCategory
    describe('createCategory', () => {
        const request: ProductMicroService.CreateCategoryRequest = {
            name: 'CreateCategory',
            description: 'desc',
            parentId: null,
        };

        it('should create and return a category', async () => {
            const mockCategory = new ProductCategoryEntity();

            // mock
            jest.spyOn(categoryService, 'createCategory').mockResolvedValue(mockCategory);

            // expect
            const result = await categoryController.createCategory(request);
            expect(result).toEqual(mockCategoryResponse);
            expect(categoryService.createCategory).toHaveBeenCalledWith(request);
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
        });
    });

    // getAllCategories
    describe('getAllCategories', () => {
        it('should return all categories', async () => {
            const mockCategory = new ProductCategoryEntity();

            // mock
            jest.spyOn(categoryService, 'getAllCategories').mockResolvedValue([mockCategory]);

            // expect
            const result = await categoryController.getAllCategories();
            expect(categoryService.getAllCategories).toHaveBeenCalled();
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual({ categories: [mockCategoryResponse] });
        });
    });

    // getCategoryById
    describe('getCategoryById', () => {
        const request: ProductMicroService.GetCategoryByIdRequest = { id: 1 };

        it('should return a category by id', async () => {
            const mockCategory = new ProductCategoryEntity();

            // mock
            jest.spyOn(categoryService, 'getCategoryById').mockResolvedValue(mockCategory);

            // expect
            const result = await categoryController.getCategoryById(request);
            expect(categoryService.getCategoryById).toHaveBeenCalledWith(1);
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual(mockCategoryResponse);
        });
    });

    // updateCategory
    describe('updateCategory', () => {
        const request: ProductMicroService.UpdateCategoryRequest = {
            id: 1,
            name: 'UpdateCategory',
            description: 'desc',
            parentId: null,
        };

        it('should update and return a category', async () => {
            const mockCategory = new ProductCategoryEntity();

            // mock
            jest.spyOn(categoryService, 'updateCategory').mockResolvedValue(mockCategory);

            // expect
            const result = await categoryController.updateCategory(request);
            expect(categoryService.updateCategory).toHaveBeenCalledWith(request);
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual(mockCategoryResponse);
        });
    });

    // deleteCategory
    describe('deleteCategory', () => {
        const request: ProductMicroService.DeleteCategoryRequest = { id: 1 };

        it('should call service to delete category', async () => {
            // mock
            jest.spyOn(categoryService, 'deleteCategory').mockResolvedValue(null);

            // expect
            const result = await categoryController.deleteCategory(request);
            expect(categoryService.deleteCategory).toHaveBeenCalledWith(1);
            expect(result).toEqual(null);
        });
    });
});
