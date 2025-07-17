import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryResponseMapper } from './mapper/category.response.mapper';
import { ProductMicroService } from '@app/common';

const mockCategoryService = {
    createCategory: jest.fn(),
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
};

describe('CategoryController', () => {
    let categoryController: CategoryController;

    const mockCategory = {
        id: 1,
        name: 'electron',
        description: 'desc',
        parent: null,
        children: [],
        products: [],
    };

    const mockCategoryResponse = {
        id: 1,
        name: 'electron',
        description: 'desc',
        parent: undefined,
        children: [],
        products: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [
                {
                    provide: CategoryService,
                    useValue: mockCategoryService,
                },
            ],
        }).compile();

        categoryController = module.get<CategoryController>(CategoryController);

        jest.spyOn(CategoryResponseMapper, 'toCategoryResponse').mockReturnValue(mockCategoryResponse);
    });

    // createCategory
    describe('createCategory', () => {
        it('should create and return a category', async () => {
            const request: ProductMicroService.CreateCategoryRequest = {
                name: 'CreateCategory',
                description: 'desc',
                parentId: null,
            };

            // mock
            jest.spyOn(mockCategoryService, 'createCategory').mockResolvedValue(mockCategory);

            // expect
            const result = await categoryController.createCategory(request);
            expect(result).toEqual(mockCategoryResponse);
            expect(mockCategoryService.createCategory).toHaveBeenCalledWith(request);
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
        });
    });

    // getAllCategories
    describe('getAllCategories', () => {
        it('should return all categories', async () => {
            // mock
            jest.spyOn(mockCategoryService, 'getAllCategories').mockResolvedValue([mockCategory]);

            // expect
            const result = await categoryController.getAllCategories();
            expect(mockCategoryService.getAllCategories).toHaveBeenCalled();
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual({ categories: [mockCategoryResponse] });
        });
    });

    // getCategoryById
    describe('getCategoryById', () => {
        it('should return a category by id', async () => {
            const request: ProductMicroService.GetCategoryByIdRequest = { id: 1 };

            // mock
            jest.spyOn(mockCategoryService, 'getCategoryById').mockResolvedValue(mockCategory);

            // expect
            const result = await categoryController.getCategoryById(request);
            expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(1);
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual(mockCategoryResponse);
        });
    });

    // updateCategory
    describe('updateCategory', () => {
        it('should update and return a category', async () => {
            const request: ProductMicroService.UpdateCategoryRequest = {
                id: 1,
                name: 'UpdateCategory',
                description: 'desc',
                parentId: null,
            };

            // mock
            jest.spyOn(mockCategoryService, 'updateCategory').mockResolvedValue(mockCategory);

            // expect
            const result = await categoryController.updateCategory(request);
            expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(request);
            expect(CategoryResponseMapper.toCategoryResponse).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual(mockCategoryResponse);
        });
    });

    // deleteCategory
    describe('deleteCategory', () => {
        it('should call service to delete category', async () => {
            const request: ProductMicroService.DeleteCategoryRequest = { id: 1 };

            // mock
            jest.spyOn(mockCategoryService, 'deleteCategory').mockResolvedValue(null);

            // expect
            const result = await categoryController.deleteCategory(request);
            expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1);
            expect(result).toEqual(null);
        });
    });
});
