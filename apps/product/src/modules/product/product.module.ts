import { forwardRef, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoryModule } from '../category/category.module';
import { StockModule } from '../stock/stock.module';

@Module({
    imports: [forwardRef(() => CategoryModule), forwardRef(() => StockModule)],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductModule {}
