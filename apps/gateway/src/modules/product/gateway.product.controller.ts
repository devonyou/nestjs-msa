import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiController } from '../../common/decorator/api.controller.decorator';
import { GatewayProductService } from './gateway.product.service';
import {
    CategoryListResponseDto,
    CategoryResponseDto,
    CreateCategoryRequestDto,
    UpdateCategoryRequestDto,
} from './dto/category.dto';
import { Auth } from '../../common/decorator/auth.decorator';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Rbac } from '../../common/decorator/rbac.decorator';
import { ProductMicroService, UserMicroService } from '@app/common';
import {
    CreateProductRequestDto,
    GetProductListQueryDto,
    ProductListResponseDto,
    ProductResponseDto,
    UpdateProductRequestDto,
} from './dto/product.dto';
import { GeneratePresignedUrlRequestDto, GeneratePresignedUrlResponseDto } from './dto/presigned.url.dto';
import { ProductStockResponseDto, UpsertStockRequestDto } from './dto/product.stock.dto';

@ApiController('product')
export class GatewayProductController {
    constructor(private readonly gatewayProductService: GatewayProductService) {}

    @Post()
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '상품 생성' })
    @ApiCreatedResponse({ description: '상품 생성 성공', type: ProductResponseDto })
    createProduct(@Body() body: CreateProductRequestDto): Promise<ProductResponseDto> {
        return this.gatewayProductService.createProduct(body);
    }

    @Get()
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '상품 목록 조회' })
    @ApiOkResponse({ description: '상품 목록 조회 성공', type: [ProductResponseDto] })
    getProducts(@Query() query: GetProductListQueryDto): Promise<ProductListResponseDto> {
        return this.gatewayProductService.getProducts(query);
    }

    @Get(':productId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '상품 상세 조회' })
    @ApiOkResponse({ description: '상품 상세 조회 성공', type: ProductResponseDto })
    getProductById(@Param('productId') productId: number): Promise<ProductResponseDto> {
        return this.gatewayProductService.getProductById(productId);
    }

    @Patch(':productId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '상품 수정' })
    @ApiOkResponse({ description: '상품 수정 성공', type: ProductResponseDto })
    updateProduct(
        @Param('productId') productId: number,
        @Body() body: UpdateProductRequestDto,
    ): Promise<ProductResponseDto> {
        return this.gatewayProductService.updateProduct(productId, body);
    }

    @Delete(':productId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '상품 삭제' })
    @ApiOkResponse({ description: '상품 삭제 성공', type: null })
    deleteProduct(@Param('productId') productId: number): Promise<ProductMicroService.Empty> {
        return this.gatewayProductService.deleteProduct(productId);
    }

    @Post('category')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 생성' })
    @ApiCreatedResponse({ description: '카테고리 생성 성공', type: CategoryResponseDto })
    createCategory(@Body() body: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
        return this.gatewayProductService.createCategory(body);
    }

    @Get('category')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 목록 조회' })
    @ApiOkResponse({ description: '카테고리 목록 조회 성공', type: [CategoryResponseDto] })
    getCategories(): Promise<CategoryListResponseDto> {
        return this.gatewayProductService.getCategories();
    }

    @Get('category/:categoryId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 상세 조회' })
    @ApiOkResponse({ description: '카테고리 상세 조회 성공', type: CategoryResponseDto })
    getCategoryById(@Param('categoryId') categoryId: number): Promise<CategoryResponseDto> {
        return this.gatewayProductService.getCategoryById(categoryId);
    }

    @Patch('category/:categoryId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 수정' })
    @ApiOkResponse({ description: '카테고리 수정 성공', type: CategoryResponseDto })
    updateCategory(
        @Param('categoryId') categoryId: number,
        @Body() body: UpdateCategoryRequestDto,
    ): Promise<CategoryResponseDto> {
        return this.gatewayProductService.updateCategory(categoryId, body);
    }

    @Delete('category/:categoryId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 삭제' })
    @ApiOkResponse({ description: '카테고리 삭제 성공', type: null })
    deleteCategory(@Param('categoryId') categoryId: number): Promise<ProductMicroService.Empty> {
        return this.gatewayProductService.deleteCategory(categoryId);
    }

    @Post('presigned-url')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: 'presigned url 생성' })
    @ApiCreatedResponse({ description: 'presigned url 생성 성공', type: GeneratePresignedUrlResponseDto })
    generatePresignedUrl(@Body() body: GeneratePresignedUrlRequestDto): Promise<GeneratePresignedUrlResponseDto> {
        return this.gatewayProductService.generatePresignedUrl(body);
    }

    @Get('stock/:productId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '재고 조회' })
    @ApiOkResponse({ description: '재고 조회 성공', type: ProductStockResponseDto })
    getStockByProductId(@Param('productId') productId: number): Promise<ProductStockResponseDto> {
        return this.gatewayProductService.getStockByProductId(productId);
    }

    @Patch('stock/:productId')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '재고 수정' })
    @ApiOkResponse({ description: '재고 수정 성공', type: ProductStockResponseDto })
    upsertStock(
        @Param('productId') productId: number,
        @Body() body: UpsertStockRequestDto,
    ): Promise<ProductStockResponseDto> {
        return this.gatewayProductService.upsertStock(productId, body);
    }
}
