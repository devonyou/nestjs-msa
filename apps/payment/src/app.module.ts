import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { PaymentModule } from './payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
    NOTIFICATION_SERVICE,
    NotificationMicroService,
    traceInterceptor,
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
                NOTIFICATION_HOST: Joi.string().required(),
                NOTIFICATION_TCP_PORT: Joi.number().required(),
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
                        rejectUnautorized: false,
                    },
                }),
            }),
        }),
        ClientsModule.registerAsync({
            isGlobal: true,
            clients: [
                {
                    name: NOTIFICATION_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('payment')],
                            },
                            package: NotificationMicroService.protobufPackage,
                            protoPath: join(
                                process.cwd(),
                                'proto',
                                'notification.proto',
                            ),
                            url: configService.get<string>(
                                'NOTIFICATION_GRPC_URL',
                            ),
                        },
                    }),
                    inject: [ConfigService],
                },
            ],
        }),
        PaymentModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
