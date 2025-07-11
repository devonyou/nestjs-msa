import { forwardRef, Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [forwardRef(() => ProductModule)],
    controllers: [StockController],
    providers: [StockService],
})
export class StockModule {}
