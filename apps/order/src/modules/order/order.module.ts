import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { RedisService } from '@app/common';
import { OrderProductService } from './order.product.service';
import { OrderPaymentService } from './order.payment.service';

@Module({
    imports: [],
    controllers: [OrderController],
    providers: [OrderService, RedisService, OrderProductService, OrderPaymentService],
})
export class OrderModule {}
