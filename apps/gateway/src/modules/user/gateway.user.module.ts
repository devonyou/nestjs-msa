import { Module } from '@nestjs/common';
import { GatewayUserController } from './gateway.user.controller';
import { GatewayUserService } from './gateway.user.service';

@Module({
    imports: [],
    controllers: [GatewayUserController],
    providers: [GatewayUserService],
    exports: [GatewayUserService],
})
export class GatewayUserModule {}
