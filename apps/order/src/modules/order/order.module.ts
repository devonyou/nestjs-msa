import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
// import { RedisLockService, RedisService } from '@app/common';
import { OrderProductService } from './order.product.service';
import { OrderPaymentService } from './order.payment.service';
import { OrderNotificationService } from './order.notification.service';
import { RedisModule } from '@app/common';

@Module({
    imports: [RedisModule],
    controllers: [OrderController],
    providers: [OrderService, OrderProductService, OrderPaymentService, OrderNotificationService],
})
export class OrderModule {}
