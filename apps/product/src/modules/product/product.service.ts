import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { ILike, In, Repository } from 'typeorm';
import { ProductMicroService, S3Service } from '@app/common';
import { CategoryService } from '../category/category.service';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { ConfigService } from '@nestjs/config';
import { ProductImageEntity } from '../../entities/product.image.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @Inject(forwardRef(() => CategoryService))
        private readonly categoryService: CategoryService,
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
        @InjectRepository(ProductImageEntity)
        private readonly productImageRepository: Repository<ProductImageEntity>,
    ) {}

    @Transactional()
    async createProduct(request: ProductMicroService.CreateProductRequest): Promise<ProductEntity> {
        const { images } = request;

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

        await this.upsertProductImage(product.id, images);

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
            relations: ['category', 'images', 'stock'],
        });

        return {
            products,
            total,
        };
    }

    async getProductById(request: ProductMicroService.GetProductByIdRequest): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({
            where: { id: request.id },
            relations: ['category', 'images', 'stock'],
        });

        return product;
    }

    async getProductsByIds(
        request: ProductMicroService.GetProductsByIdsRequest,
    ): Promise<{ products: ProductEntity[]; total: number }> {
        const { ids } = request;
        const [products, total] = await this.productRepository.findAndCount({ where: { id: In(ids) } });

        return {
            products,
            total,
        };
    }

    @Transactional()
    async updateProduct(request: ProductMicroService.UpdateProductRequest): Promise<ProductEntity> {
        const { id, name, description, price, categoryId, images } = request;

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

        await this.upsertProductImage(id, images);

        const savedProduct = await this.getProductById({ id });

        return savedProduct;
    }

    deleteProduct(id: number) {
        this.productRepository.delete(id);
    }

    async generatePresignedUrl(contentType: string): Promise<ProductMicroService.GeneratePresignedUrlResponse> {
        try {
            const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
            const path = `temp/product`;
            const expiresIn = 300;

            const result = await this.s3Service.generatePresignedUrl(
                bucketName,
                path,
                expiresIn,
                contentType,
                'public-read',
            );
            return {
                ...result,
                filePath: result.key,
            };
        } catch (error) {
            throw new GrpcInternalException('Failed to generate presigned url');
        }
    }

    async upsertProductImage(
        productId: number,
        images: { url: string; main?: boolean }[],
    ): Promise<ProductImageEntity[]> {
        if (!images?.length) return [];

        await this.productImageRepository.delete({ product: { id: productId } });

        const savedImages = await Promise.all(
            images.map(async ({ url, main }) => {
                const productImage = this.productImageRepository.create({ url, main, product: { id: productId } });
                return this.productImageRepository.save(productImage);
            }),
        );

        return savedImages;
    }
}
