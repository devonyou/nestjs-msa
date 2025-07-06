import { Module } from '@nestjs/common';
import { GatewayProductController } from './gateway.product.controller';

@Module({
    imports: [],
    controllers: [GatewayProductController],
    providers: [],
})
export class GatewayProductModule {}
