import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategoryEntity } from '../../entities/product.category.entity';
import { Repository } from 'typeorm';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly categoryRepository: Repository<ProductCategoryEntity>,
    ) {}

    async createCategory(request: ProductMicroService.CreateCategoryRequest): Promise<ProductCategoryEntity> {
        const { name, parentId, description } = request;
        let parentCategory: ProductCategoryEntity;

        if (parentId) {
            parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
            if (!parentCategory) {
                throw new GrpcNotFoundException('상위 카테고리를 찾을 수 없습니다');
            }
        }

        const category = this.categoryRepository.create({
            name,
            description,
            parent: parentCategory,
        });

        await this.categoryRepository.save(category);

        const savedCategory = await this.getCategoryById(category.id);

        return savedCategory;
    }

    async getAllCategories(): Promise<ProductCategoryEntity[]> {
        const categories = await this.categoryRepository.find({
            relations: ['parent', 'children', 'products'],
        });

        return categories;
    }

    async getCategoryById(id: number): Promise<ProductCategoryEntity> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children', 'products'],
        });

        return category;
    }

    async updateCategory(request: ProductMicroService.UpdateCategoryRequest): Promise<ProductCategoryEntity> {
        const { id, name, parentId, description } = request;

        let parentCategory: ProductCategoryEntity;

        if (parentId) {
            parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
            if (!parentCategory) {
                throw new GrpcNotFoundException('상위 카테고리를 찾을 수 없습니다');
            }
        }

        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
        }

        category.name = name;
        category.description = description;
        category.parent = parentId && parentCategory;

        await this.categoryRepository.save(category);

        const savedCategory = await this.getCategoryById(id);

        return savedCategory;
    }

    async deleteCategory(id: number) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
        }

        await this.categoryRepository.delete(id);
    }
}
