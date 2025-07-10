import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcInterceptor, QueryFailedExceptionFilter, RpcExceptionFilter } from '@app/common';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

async function bootstrap() {
    initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const GRPC_URL = configService.getOrThrow<string>('GRPC_URL');
    const RABBITMQ_URL = configService.getOrThrow<string>('RABBITMQ_URL');

    app.useGlobalFilters(new RpcExceptionFilter(), new QueryFailedExceptionFilter());
    app.useGlobalInterceptors(new GrpcInterceptor());

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.GRPC,
            options: {
                url: GRPC_URL,
                package: 'order',
                protoPath: join(process.cwd(), 'proto', 'order.proto'),
            },
        },
        { inheritAppConfig: true },
    );

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [RABBITMQ_URL],
            queue: 'order-queue',
            queueOptions: {
                durable: true,
            },
            prefetchCount: 1,
            noAck: false,
        },
    });

    await app.init();
    await app.startAllMicroservices();
}

bootstrap().catch(error => {
    new Logger(process.env.NODE_ENV).error(`❌ Order Server error ${error}`);
    process.exit(1);
});
