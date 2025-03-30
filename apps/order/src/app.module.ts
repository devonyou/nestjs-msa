import {
    PAYMENT_SERVICE,
    PaymentMicroService,
    PRODUCT_SERVICE,
    ProductMicroService,
    traceInterceptor,
    USER_SERVICE,
    UserMicroService,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { join } from 'path';
import { OrderModule } from './order/order.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                GRPC_URL: Joi.string().required(),
                DB_URL: Joi.string().required(),
                USER_GRPC_URL: Joi.string().required(),
                PRODUCT_GRPC_URL: Joi.string().required(),
                PAYMENT_GRPC_URL: Joi.string().required(),
            }),
        }),

        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('DB_URL'),
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
                            channelOptions: {
                                interceptors: [traceInterceptor('order')],
                            },
                            package: UserMicroService.protobufPackage,
                            protoPath: join(
                                process.cwd(),
                                'proto',
                                'user.proto',
                            ),
                            url: configService.get<string>('USER_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
                {
                    inject: [ConfigService],
                    name: PRODUCT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('order')],
                            },
                            package: ProductMicroService.protobufPackage,
                            protoPath: join(
                                process.cwd(),
                                'proto',
                                'product.proto',
                            ),
                            url: configService.get<string>('PRODUCT_GRPC_URL'),
                        },
                    }),
                },
                {
                    inject: [ConfigService],
                    name: PAYMENT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('order')],
                            },
                            package: PaymentMicroService.protobufPackage,
                            protoPath: join(
                                process.cwd(),
                                'proto',
                                'payment.proto',
                            ),
                            url: configService.get<string>('PAYMENT_GRPC_URL'),
                        },
                    }),
                },
            ],
        }),
        OrderModule,
    ],
})
export class AppModule {}
