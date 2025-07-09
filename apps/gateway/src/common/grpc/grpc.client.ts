import { OrderMicroService, ProductMicroService, UserMicroService } from '@app/common';
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
                url: `${configService.getOrThrow<string>('USER_GRPC_URL')}`,
                protoPath: join(process.cwd(), 'proto', 'user.proto'),
            },
        }),
    },
    {
        name: ProductMicroService.PRODUCT_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
                package: ProductMicroService.protobufPackage,
                url: `${configService.getOrThrow<string>('PRODUCT_GRPC_URL')}`,
                protoPath: join(process.cwd(), 'proto', 'product.proto'),
            },
        }),
    },
    {
        name: OrderMicroService.ORDER_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
                package: OrderMicroService.protobufPackage,
                url: `${configService.getOrThrow<string>('ORDER_GRPC_URL')}`,
                protoPath: join(process.cwd(), 'proto', 'order.proto'),
            },
        }),
    },
];
