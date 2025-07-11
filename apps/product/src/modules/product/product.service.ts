import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { DataSource, ILike, In, QueryRunner } from 'typeorm';
import { ProductMicroService, S3Service } from '@app/common';
import { CategoryService } from '../category/category.service';
import { GrpcInternalException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { ConfigService } from '@nestjs/config';
import { ProductImageEntity } from '../../entities/product.image.entity';
import { ProductCategoryEntity } from '../../entities/product.category.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectDataSource() private readonly datasource: DataSource,

        @Inject(forwardRef(() => CategoryService))
        private readonly categoryService: CategoryService,
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) {}

    /**
     * 상품 생성
     * @param request ProductMicroService.CreateProductRequest
     * @returns ProductEntity
     */
    async createProduct(request: ProductMicroService.CreateProductRequest): Promise<ProductEntity> {
        const { images } = request;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const category = await qr.manager.getRepository(ProductCategoryEntity).findOne({
                where: { id: request.categoryId },
            });

            if (!category) {
                throw new GrpcNotFoundException('카테고리를 찾을 수 없습니다');
            }

            const product = await qr.manager.getRepository(ProductEntity).create({
                name: request.name,
                description: request.description,
                price: request.price,
                category: { id: category.id },
            });

            await qr.manager.getRepository(ProductEntity).save(product);

            await this.upsertProductImage(qr, product.id, images);

            const savedProduct = await qr.manager.getRepository(ProductEntity).findOne({
                where: { id: product.id },
                relations: ['category', 'images', 'stock'],
            });

            await qr.commitTransaction();

            return savedProduct;
        } catch (error) {
            await qr.rollbackTransaction();

            throw error;
        } finally {
            await qr.release();
        }
    }

    /**
     * 상품 목록 조회
     * @param request ProductMicroService.GetProductsRequest
     * @returns { products: ProductEntity[]; total: number }
     */
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

        const [products, total] = await this.datasource.getRepository(ProductEntity).findAndCount({
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

    /**
     * 상품 상세 조회
     * @param request ProductMicroService.GetProductByIdRequest
     * @returns ProductEntity
     */
    async getProductById(request: ProductMicroService.GetProductByIdRequest): Promise<ProductEntity> {
        const product = await this.datasource.getRepository(ProductEntity).findOne({
            where: { id: request.id },
            relations: ['category', 'images', 'stock'],
        });

        return product;
    }

    /**
     * 상품 목록 조회
     * @param request ProductMicroService.GetProductsByIdsRequest
     * @returns { products: ProductEntity[]; total: number }
     */
    async getProductsByIds(
        request: ProductMicroService.GetProductsByIdsRequest,
    ): Promise<{ products: ProductEntity[]; total: number }> {
        const { ids } = request;
        const [products, total] = await this.datasource
            .getRepository(ProductEntity)
            .findAndCount({ where: { id: In(ids) } });

        return {
            products,
            total,
        };
    }

    /**
     * 상품 수정
     * @param request ProductMicroService.UpdateProductRequest
     * @returns ProductEntity
     */
    async updateProduct(request: ProductMicroService.UpdateProductRequest): Promise<ProductEntity> {
        const { id, name, description, price, categoryId, images } = request;

        // qr
        const qr = this.datasource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const product = await qr.manager.getRepository(ProductEntity).findOne({ where: { id } });

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

            await qr.manager.getRepository(ProductEntity).save(product);

            await this.upsertProductImage(qr, id, images);

            const savedProduct = await qr.manager.getRepository(ProductEntity).findOne({
                where: { id },
                relations: ['category', 'images', 'stock'],
            });

            await qr.commitTransaction();

            return savedProduct;
        } catch (error) {
            await qr.rollbackTransaction();

            throw error;
        } finally {
            await qr.release();
        }
    }

    /**
     * 상품 삭제
     * @param id number
     */
    deleteProduct(id: number) {
        this.datasource.getRepository(ProductEntity).delete(id);
    }

    /**
     * 프리사인드 url 생성
     * @param contentType string
     * @returns ProductMicroService.GeneratePresignedUrlResponse
     */
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

    /**
     * 상품 이미지 저장
     * @param qr QueryRunner
     * @param productId number
     * @param images { url: string; main?: boolean }[]
     * @returns ProductImageEntity[]
     */
    async upsertProductImage(
        qr: QueryRunner,
        productId: number,
        images: { url: string; main?: boolean }[],
    ): Promise<ProductImageEntity[]> {
        if (!images?.length) return [];

        await qr.manager.getRepository(ProductImageEntity).delete({ product: { id: productId } });

        const savedImages = await Promise.all(
            images.map(async ({ url, main }) => {
                const productImage = qr.manager.getRepository(ProductImageEntity).create({
                    url,
                    main,
                    product: { id: productId },
                });
                return qr.manager.getRepository(ProductImageEntity).save(productImage);
            }),
        );

        return savedImages;
    }
}
