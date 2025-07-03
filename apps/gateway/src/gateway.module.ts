import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { HttpLoggerMiddleware } from './common/logger/http.logger.middleware';
import { GatewayAuthModule } from './modules/auth/gateway.auth.module';
import { GatewayUserModule } from './modules/user/gateway.user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        GatewayAuthModule,
        GatewayUserModule,
    ],
    controllers: [],
    providers: [GatewayService],
})
export class GatewayModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
