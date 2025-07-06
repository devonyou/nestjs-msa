import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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

@ApiController('product')
export class GatewayProductController {
    constructor(private readonly gatewayProductService: GatewayProductService) {}

    @Post('category')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 생성' })
    @ApiCreatedResponse({ description: '카테고리 생성 성공', type: CategoryResponseDto })
    createCategory(@Body() body: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
        return this.gatewayProductService.createCategory(body);
    }

    @Get('categories')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 목록 조회' })
    @ApiOkResponse({ description: '카테고리 목록 조회 성공', type: [CategoryResponseDto] })
    getCategories(): Promise<CategoryListResponseDto> {
        return this.gatewayProductService.getCategories();
    }

    @Get('category/:id')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 상세 조회' })
    @ApiOkResponse({ description: '카테고리 상세 조회 성공', type: CategoryResponseDto })
    getCategoryById(@Param('id') id: number): Promise<CategoryResponseDto> {
        return this.gatewayProductService.getCategoryById(id);
    }

    @Patch('category/:id')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 수정' })
    @ApiOkResponse({ description: '카테고리 수정 성공', type: CategoryResponseDto })
    updateCategory(@Param('id') id: number, @Body() body: UpdateCategoryRequestDto): Promise<CategoryResponseDto> {
        return this.gatewayProductService.updateCategory(id, body);
    }

    @Delete('category/:id')
    @Auth(false)
    @Rbac([UserMicroService.UserRole.ADMIN])
    @ApiOperation({ summary: '카테고리 삭제' })
    @ApiOkResponse({ description: '카테고리 삭제 성공', type: null })
    deleteCategory(@Param('id') id: number): Promise<ProductMicroService.Empty> {
        return this.gatewayProductService.deleteCategory(id);
    }
}
