import { NotificationMicroService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClient: ClientsProviderAsyncOptions[] = [
    {
        name: NotificationMicroService.NOTIFICATION_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
                package: NotificationMicroService.protobufPackage,
                url: `${configService.getOrThrow<string>('NOTIFICATION_GRPC_URL')}`,
                protoPath: join(process.cwd(), 'proto', 'notification.proto'),
            },
        }),
    },
];
