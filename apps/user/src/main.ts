import { NestFactory } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RpcExceptionFilter } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(UserModule);

    const configService = app.get(ConfigService);
    const GRPC_HOST = configService.getOrThrow<string>('GRPC_HOST');
    const GRPC_PORT = configService.getOrThrow<number>('GRPC_PORT');

    app.useGlobalFilters(new RpcExceptionFilter());

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.GRPC,
            options: {
                url: `${GRPC_HOST}:${GRPC_PORT}`,
                package: 'user',
                protoPath: join(process.cwd(), 'proto', 'user.proto'),
            },
        },
        { inheritAppConfig: true },
    );

    await app.init();
    await app.startAllMicroservices();
    await app.listen(configService.getOrThrow<number>('HTTP_PORT'));
}

bootstrap().catch(error => {
    new Logger(process.env.NODE_ENV).error(`❌ User Server error ${error}`);
    process.exit(1);
});
