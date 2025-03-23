import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
    ORDER_SERVICE,
    OrderMicroService,
    PRODUCT_SERVICE,
    ProductMicroService,
    USER_SERVICE,
    UserMicroService,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { BearerTokenMiddleware } from './auth/middleware/bearer.token.middleware';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                HTTP_PORT: Joi.number().required(),
                USER_HOST: Joi.string().required(),
                USER_TCP_PORT: Joi.number().required(),
                PRODUCT_HOST: Joi.string().required(),
                PRODUCT_TCP_PORT: Joi.number().required(),
                ORDER_HOST: Joi.string().required(),
                ORDER_TCP_PORT: Joi.number().required(),
            }),
        }),
        ClientsModule.registerAsync({
            isGlobal: true,
            clients: [
                {
                    name: USER_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            package: UserMicroService.protobufPackage,
                            protoPath: join(process.cwd(), 'proto', 'user.proto'),
                            url: configService.get<string>('USER_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
                {
                    name: PRODUCT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            package: ProductMicroService.protobufPackage,
                            protoPath: join(process.cwd(), 'proto', 'product.proto'),
                            url: configService.get<string>('PRODUCT_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
                {
                    name: ORDER_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            package: OrderMicroService.protobufPackage,
                            protoPath: join(process.cwd(), 'proto', 'order.proto'),
                            url: configService.get<string>('ORDER_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
            ],
        }),
        OrderModule,
        ProductModule,
        AuthModule,
    ],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(BearerTokenMiddleware).forRoutes('order');
    }
}
