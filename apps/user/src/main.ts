import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
    GrpcInterceptor,
    HealthMicroService,
    QueryFailedExceptionFilter,
    RpcExceptionFilter,
    UserMicroService,
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
                package: [UserMicroService.protobufPackage, HealthMicroService.protobufPackage],
                protoPath: [join(process.cwd(), 'proto', 'user.proto'), join(process.cwd(), 'proto', 'health.proto')],
            },
        },
        { inheritAppConfig: true },
    );

    await app.init();
    await app.startAllMicroservices();
    await app.listen(configService.getOrThrow<number>('HTTP_PORT'));
}

bootstrap()
    .then(() => {
        new Logger(process.env.NODE_ENV).log(`✅ User MSA Server on ${process.env.GRPC_URL}`);
        new Logger(process.env.NODE_ENV).log(`✅ User HTTP Server on ${process.env.HTTP_PORT}`);
    })
    .catch(error => {
        new Logger(process.env.NODE_ENV).error(`❌ User Server error ${error}`);
        process.exit(1);
    });
