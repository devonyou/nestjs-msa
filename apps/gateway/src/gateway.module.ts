import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { HttpLoggerMiddleware } from './common/logger/http.logger.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),
    ],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
