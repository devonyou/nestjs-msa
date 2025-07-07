import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { ProductMicroService } from '@app/common';
import { CategoryService } from '../category/category.service';
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @Inject(forwardRef(() => CategoryService))
        private readonly categoryService: CategoryService,
    ) {}

    async createProduct(request: ProductMicroService.CreateProductRequest): Promise<ProductEntity> {
        const category = await this.categoryService.getCategoryById(request.categoryId);
        if (!category) {
            throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
        }

        const product = this.productRepository.create({
            name: request.name,
            description: request.description,
            price: request.price,
            category: { id: category.id },
        });

        await this.productRepository.save(product);

        const savedProduct = await this.getProductById({ id: product.id });

        return savedProduct;
    }

    async getProducts(request: ProductMicroService.GetProductsRequest): Promise<{
        products: ProductEntity[];
        total: number;
    }> {
        const { page = 1, limit = 10, sort = 'createdAt_DESC', categoryId, name } = request;

        const skip = (page - 1) * limit;

        const [sortField, sortOrder] = sort.split('_');
        const order: any = {
            [sortField]: sortOrder?.toUpperCase(),
        };

        const where: any = {};
        if (categoryId) where.category = { id: categoryId };
        if (name) where.name = ILike(`%${name}%`);

        const [products, total] = await this.productRepository.findAndCount({
            where,
            order,
            skip,
            take: limit,
            relations: ['category'],
        });

        return {
            products,
            total,
        };
    }

    async getProductById(request: ProductMicroService.GetProductByIdRequest): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({
            where: { id: request.id },
            relations: ['category', 'category.parent'],
        });

        return product;
    }

    async updateProduct(request: ProductMicroService.UpdateProductRequest): Promise<ProductEntity> {
        const { id, name, description, price, categoryId } = request;

        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) {
            throw new GrpcNotFoundException('상품을 찾을 수 없습니다');
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (categoryId) {
            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
            product.category = category;
        }

        await this.productRepository.save(product);

        const savedProduct = await this.getProductById({ id });

        return savedProduct;
    }

    deleteProduct(id: number) {
        this.productRepository.delete(id);
    }
}
