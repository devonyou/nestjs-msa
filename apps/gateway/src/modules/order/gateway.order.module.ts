import { Module } from '@nestjs/common';
import { GatewayOrderController } from './gateway.order.controller';
import { GatewayOrderService } from './gateway.order.service';

@Module({
    imports: [],
    controllers: [GatewayOrderController],
    providers: [GatewayOrderService],
})
export class GatewayOrderModule {}
