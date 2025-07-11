import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProductCategoryEntity } from '../../entities/product.category.entity';
import { DataSource } from 'typeorm';
import { ProductMicroService } from '@app/common';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class CategoryService {
    constructor(@InjectDataSource() private readonly datasource: DataSource) {}

    /**
     * 카테고리 생성
     * @param request ProductMicroService.CreateCategoryRequest
     * @returns ProductCategoryEntity
     */
    async createCategory(request: ProductMicroService.CreateCategoryRequest): Promise<ProductCategoryEntity> {
        const { name, parentId, description } = request;
        let parentCategory: ProductCategoryEntity;

        if (parentId) {
            parentCategory = await this.datasource
                .getRepository(ProductCategoryEntity)
                .findOne({ where: { id: parentId } });
            if (!parentCategory) {
                throw new GrpcNotFoundException('상위 카테고리를 찾을 수 없습니다');
            }
        }

        const category = this.datasource.getRepository(ProductCategoryEntity).create({
            name,
            description,
            parent: parentCategory,
        });

        await this.datasource.getRepository(ProductCategoryEntity).save(category);

        const savedCategory = await this.getCategoryById(category.id);

        return savedCategory;
    }

    /**
     * 모든 카테고리 조회
     * @returns ProductCategoryEntity[]
     */
    async getAllCategories(): Promise<ProductCategoryEntity[]> {
        const categories = await this.datasource.getRepository(ProductCategoryEntity).find({
            relations: ['parent', 'children', 'products'],
        });

        return categories;
    }

    /**
     * 카테고리 상세 조회
     * @param id number
     * @returns ProductCategoryEntity
     */
    async getCategoryById(id: number): Promise<ProductCategoryEntity> {
        const category = await this.datasource
            .getRepository(ProductCategoryEntity)
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.children', 'child')
            .leftJoinAndSelect('child.children', 'grandchild')
            .leftJoinAndSelect('category.products', 'product')
            .where('category.id = :id', { id })
            .getOne();

        return category;
    }

    /**
     * 카테고리 수정
     * @param request ProductMicroService.UpdateCategoryRequest
     * @returns ProductCategoryEntity
     */
    async updateCategory(request: ProductMicroService.UpdateCategoryRequest): Promise<ProductCategoryEntity> {
        const { id, name, parentId, description } = request;

        let parentCategory: ProductCategoryEntity;

        if (parentId) {
            parentCategory = await this.datasource
                .getRepository(ProductCategoryEntity)
                .findOne({ where: { id: parentId } });
            if (!parentCategory) {
                throw new GrpcNotFoundException('상위 카테고리를 찾을 수 없습니다');
            }
        }

        const category = await this.datasource.getRepository(ProductCategoryEntity).findOne({ where: { id } });
        if (!category) {
            throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
        }

        category.name = name;
        category.description = description;
        category.parent = parentId && parentCategory;

        await this.datasource.getRepository(ProductCategoryEntity).save(category);

        const savedCategory = await this.getCategoryById(id);

        return savedCategory;
    }

    /**
     * 카테고리 삭제
     * @param id number
     */
    async deleteCategory(id: number) {
        const category = await this.datasource.getRepository(ProductCategoryEntity).findOne({ where: { id } });
        if (!category) {
            throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
        }

        await this.datasource.getRepository(ProductCategoryEntity).delete(id);
    }
}
