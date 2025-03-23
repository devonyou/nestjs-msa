import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { OrderModule } from './order/order.module';
import {
    PAYMENT_SERVICE,
    PaymentMicroService,
    PRODUCT_SERVICE,
    ProductMicroService,
    USER_SERVICE,
    UserMicroService,
} from '@app/common';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                HTTP_PORT: Joi.number().required(),
                TCP_PORT: Joi.number().required(),
                DB_URL: Joi.string().required(),
                USER_HOST: Joi.string().required(),
                USER_TCP_PORT: Joi.number().required(),
                PRODUCT_HOST: Joi.string().required(),
                PRODUCT_TCP_PORT: Joi.number().required(),
                PAYMENT_HOST: Joi.string().required(),
                PAYMENT_TCP_PORT: Joi.number().required(),
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
                    name: PAYMENT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            package: PaymentMicroService.protobufPackage,
                            protoPath: join(process.cwd(), 'proto', 'payment.proto'),
                            url: configService.get<string>('PAYMENT_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
            ],
        }),
        OrderModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
