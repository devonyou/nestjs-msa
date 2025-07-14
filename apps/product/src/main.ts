import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
    GrpcInterceptor,
    HealthMicroService,
    ProductMicroService,
    QueryFailedExceptionFilter,
    RpcExceptionFilter,
} from '@app/common';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const GRPC_URL = configService.getOrThrow<string>('GRPC_URL');

    app.useGlobalFilters(new RpcExceptionFilter(), new QueryFailedExceptionFilter());
    app.useGlobalInterceptors(new GrpcInterceptor());

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.GRPC,
            options: {
                url: GRPC_URL,
                package: [ProductMicroService.protobufPackage, HealthMicroService.protobufPackage],
                protoPath: [
                    join(process.cwd(), 'proto', 'product.proto'),
                    join(process.cwd(), 'proto', 'health.proto'),
                ],
            },
        },
        { inheritAppConfig: true },
    );

    await app.init();
    await app.startAllMicroservices();
}

bootstrap().catch(error => {
    new Logger(process.env.NODE_ENV).error(`❌ Product Server error ${error}`);
    process.exit(1);
});
