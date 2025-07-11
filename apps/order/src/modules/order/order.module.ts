import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { RedisService } from '@app/common';
import { OrderProductService } from './order.product.service';

@Module({
    imports: [],
    controllers: [OrderController],
    providers: [OrderService, RedisService, OrderProductService],
})
export class OrderModule {}
