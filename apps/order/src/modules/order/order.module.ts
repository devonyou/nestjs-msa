import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { RedisService } from '@app/common';
import { OrderProductService } from './order.product.service';
import { OrderPaymentService } from './order.payment.service';
import { OrderNotificationService } from './order.notification.service';

@Module({
    imports: [],
    controllers: [OrderController],
    providers: [OrderService, RedisService, OrderProductService, OrderPaymentService, OrderNotificationService],
})
export class OrderModule {}
