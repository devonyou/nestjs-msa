import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryEntity } from '../../entities/product.category.entity';
import { CategoryController } from './category.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategoryEntity])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
