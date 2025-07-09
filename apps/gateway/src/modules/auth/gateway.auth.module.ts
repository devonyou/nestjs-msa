import { forwardRef, Module } from '@nestjs/common';
import { GatewayAuthController } from './gateway.auth.controller';
import { GatewayAuthService } from './gateway.auth.service';
import { GatewayUserModule } from '../user/gateway.user.module';

@Module({
    imports: [forwardRef(() => GatewayUserModule)],
    controllers: [GatewayAuthController],
    providers: [GatewayAuthService],
})
export class GatewayAuthModule {}
