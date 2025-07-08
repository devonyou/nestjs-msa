import { forwardRef, Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStockEntity } from '../../entities/product.stock.entity';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [TypeOrmModule.forFeature([ProductStockEntity]), forwardRef(() => ProductModule)],
    controllers: [StockController],
    providers: [StockService],
})
export class StockModule {}
