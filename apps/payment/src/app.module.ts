import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { PaymentModule } from './payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from '@app/common';

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
            }),
        }),
        ClientsModule.registerAsync({
            isGlobal: true,
            clients: [
                {
                    name: NOTIFICATION_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.RMQ,
                        options: {
                            urls: ['amqp://rabbitmq:5672'],
                            queue: 'notification-queue',
                            queueOptions: {
                                durable: false,
                            },
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
