import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategoryEntity } from '../../entities/product.category.entity';
import { Repository } from 'typeorm';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { CategoryResponseMapper } from './mapper/category.response.mapper';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly categoryRepository: Repository<ProductCategoryEntity>,
    ) {}

    async createCategory(
        request: ProductMicroService.CreateCategoryRequest,
    ): Promise<ProductMicroService.CategoryResponse> {
        const { name, parentId, description } = request;
        let parentCategory: ProductCategoryEntity;

        if (parentId) {
            parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
            if (!parentCategory) {
                throw new GrpcNotFoundException('Parent category not found');
            }
        }

        const category = this.categoryRepository.create({
            name,
            description,
            parent: parentCategory,
        });

        await this.categoryRepository.save(category);

        const savedCategory = await this.categoryRepository.findOne({
            where: { id: category.id },
            relations: ['parent', 'children', 'products'],
        });

        return CategoryResponseMapper.toCategoryResponse(savedCategory);
    }

    async getAllCategories(request: ProductMicroService.Empty): Promise<ProductMicroService.CategoryListResponse> {
        const {} = request;

        const categories = await this.categoryRepository.find({
            relations: ['parent', 'children', 'products'],
        });

        return {
            categories: categories.map(category => CategoryResponseMapper.toCategoryResponse(category)),
        };
    }

    async getCategoryById(id: number): Promise<ProductMicroService.CategoryResponse> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children', 'products'],
        });

        return CategoryResponseMapper.toCategoryResponse(category);
    }

    async updateCategory(
        request: ProductMicroService.UpdateCategoryRequest,
    ): Promise<ProductMicroService.CategoryResponse> {
        const { id, name, parentId, description } = request;

        let parentCategory: ProductCategoryEntity;

        if (parentId) {
            parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
            if (!parentCategory) {
                throw new GrpcNotFoundException('Parent category not found');
            }
        }

        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new GrpcNotFoundException('Category not found');
        }

        category.name = name;
        category.description = description;
        category.parent = parentId && parentCategory;

        await this.categoryRepository.save(category);

        return this.getCategoryById(id);
    }

    async deleteCategory(id: number): Promise<ProductMicroService.Empty> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new GrpcNotFoundException('Category not found');
        }

        await this.categoryRepository.delete(id);
        return null;
    }
}
