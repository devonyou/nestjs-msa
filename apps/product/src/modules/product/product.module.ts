import { forwardRef, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { CategoryModule } from '../category/category.module';
import { ProductImageEntity } from '../../entities/product.image.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity, ProductImageEntity]), forwardRef(() => CategoryModule)],
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule {}
