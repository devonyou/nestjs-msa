import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { NotificationModule } from './notification/notification.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_SERVICE, OrderMicroService, traceInterceptor } from '@app/common';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                HTTP_PORT: Joi.number().required(),
                TCP_PORT: Joi.number().required(),
                DB_URL: Joi.string().required(),
                ORDER_HOST: Joi.string().required(),
                ORDER_TCP_PORT: Joi.string().required(),
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
                    name: ORDER_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('notification')],
                            },
                            package: OrderMicroService.protobufPackage,
                            protoPath: join(process.cwd(), 'proto', 'order.proto'),
                            url: configService.get<string>('ORDER_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
            ],
        }),
        NotificationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
