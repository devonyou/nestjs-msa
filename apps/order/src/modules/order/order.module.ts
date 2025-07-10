import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDeliveryEntity } from '../../entitites/order.delivery.entity';
import { OrderEntity } from '../../entitites/order.entity';
import { OrderItemEntity } from '../../entitites/order.item.entity';
import { RedisService } from '@app/common';

@Module({
    imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, OrderDeliveryEntity])],
    controllers: [OrderController],
    providers: [OrderService, RedisService],
})
export class OrderModule {}
