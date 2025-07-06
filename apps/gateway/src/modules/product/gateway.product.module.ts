import { Module } from '@nestjs/common';
import { GatewayProductController } from './gateway.product.controller';
import { GatewayProductService } from './gateway.product.service';

@Module({
    imports: [],
    controllers: [GatewayProductController],
    providers: [GatewayProductService],
})
export class GatewayProductModule {}
