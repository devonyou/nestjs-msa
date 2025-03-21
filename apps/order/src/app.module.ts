import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { OrderModule } from './order/order.module';
import { PAYMENT_SERVICE, PRODUCT_SERVICE, USER_SERVICE } from '@app/common';

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
                        transport: Transport.TCP,
                        options: {
                            host: configService.get<string>('USER_HOST'),
                            port: configService.get<number>('USER_TCP_PORT'),
                        },
                    }),
                    inject: [ConfigService],
                },
                {
                    name: PRODUCT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.TCP,
                        options: {
                            host: configService.get<string>('PRODUCT_HOST'),
                            port: configService.get<number>('PRODUCT_TCP_PORT'),
                        },
                    }),
                    inject: [ConfigService],
                },
                {
                    name: PAYMENT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.TCP,
                        options: {
                            host: configService.get<string>('PAYMENT_HOST'),
                            port: configService.get<number>('PAYMENT_TCP_PORT'),
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
