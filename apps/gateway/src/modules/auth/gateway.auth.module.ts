import { forwardRef, Module } from '@nestjs/common';
import { GatewayAuthController } from './gateway.auth.controller';
import { GatewayAuthService } from './gateway.auth.service';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClient } from '../../common/grpc/grpc.client';
import { GatewayUserModule } from '../user/gateway.user.module';

@Module({
    imports: [
        ClientsModule.registerAsync({
            isGlobal: true,
            clients: grpcClient,
        }),
        forwardRef(() => GatewayUserModule),
    ],
    controllers: [GatewayAuthController],
    providers: [GatewayAuthService],
})
export class GatewayAuthModule {}
