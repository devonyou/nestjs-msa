import { PaymentMicroService, ProductMicroService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClient: ClientsProviderAsyncOptions[] = [
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
        name: PaymentMicroService.PAYMENT_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
                package: PaymentMicroService.protobufPackage,
                url: `${configService.getOrThrow<string>('PAYMENT_GRPC_URL')}`,
                protoPath: join(process.cwd(), 'proto', 'payment.proto'),
            },
        }),
    },
];
