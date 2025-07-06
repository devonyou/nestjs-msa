import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryEntity } from '../../entities/product.category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategoryEntity])],
    controllers: [],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
