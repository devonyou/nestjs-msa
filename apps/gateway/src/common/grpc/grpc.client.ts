import { UserMicroService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClient: ClientsProviderAsyncOptions[] = [
    {
        name: UserMicroService.USER_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
                package: UserMicroService.protobufPackage,
                url: `${configService.get<string>('USER_GRPC_HOST')}:${configService.get<number>('USER_GRPC_PORT')}`,
                protoPath: join(process.cwd(), 'proto', 'user.proto'),
            },
        }),
    },
];
