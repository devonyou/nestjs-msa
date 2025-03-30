import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderMicroService } from '@app/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: OrderMicroService.protobufPackage,
            protoPath: join(process.cwd(), 'proto', 'order.proto'),
            url: configService.get<string>('GRPC_URL'),
        },
    });

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'order',
                brokers: ['kafka:9092'],
            },
            consumer: {
                groupId: 'order-consumer',
            },
        },
    });

    await app.init();

    await app.startAllMicroservices();
}

bootstrap();
