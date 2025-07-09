import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { HttpLoggerMiddleware } from './common/logger/http.logger.middleware';
import { GatewayAuthModule } from './modules/auth/gateway.auth.module';
import { GatewayUserModule } from './modules/user/gateway.user.module';
import { GatewayProductModule } from './modules/product/gateway.product.module';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClient } from './common/grpc/grpc.client';
import { GatewayOrderModule } from './modules/order/gateway.order.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        ClientsModule.registerAsync({
            isGlobal: true,
            clients: grpcClient,
        }),

        GatewayAuthModule,
        GatewayUserModule,
        GatewayProductModule,
        GatewayOrderModule,
    ],
    controllers: [],
    providers: [],
})
export class GatewayModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
