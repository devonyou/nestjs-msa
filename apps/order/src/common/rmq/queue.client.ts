import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';

export const rmqClient: ClientsProviderAsyncOptions[] = [
    {
        inject: [ConfigService],
        name: 'ORDER_RMQ',
        useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
                urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
                queue: 'order-queue',
                queueOptions: {
                    durable: true,
                },
                prefetchCount: 1,
            },
        }),
    },
];
