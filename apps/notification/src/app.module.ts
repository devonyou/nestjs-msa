import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { NotificationModule } from './notification/notification.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
    ORDER_SERVICE,
    OrderMicroService,
    traceInterceptor,
} from '@app/common';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                HTTP_PORT: Joi.number().required(),
                TCP_PORT: Joi.number().required(),
                GRPC_URL: Joi.string().required(),
                DB_URL: Joi.string().required(),
                ORDER_HOST: Joi.string().required(),
                ORDER_TCP_PORT: Joi.string().required(),
                ORDER_GRPC_URL: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                url: configService.get<string>('DB_URL'),
                autoLoadEntities: true,
                synchronize: true,
                ...(configService.get('NODE_ENV') === 'production' && {
                    ssl: {
                        rejectUnauthorized: false,
                    },
                }),
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
                                interceptors: [
                                    traceInterceptor('notification'),
                                ],
                            },
                            package: OrderMicroService.protobufPackage,
                            protoPath: join(
                                process.cwd(),
                                'proto',
                                'order.proto',
                            ),
                            url: configService.get<string>('ORDER_GRPC_URL'),
                        },
                    }),
                    inject: [ConfigService],
                },
                {
                    name: 'KAFKA_SERVICE',
                    useFactory: () => ({
                        transport: Transport.KAFKA,
                        options: {
                            client: {
                                clientId: 'notification',
                                brokers: ['kafka:9092'],
                            },
                            consumer: {
                                groupId: 'notification-consumer',
                            },
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
