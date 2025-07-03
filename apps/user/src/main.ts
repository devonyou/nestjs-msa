import { NestFactory } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(UserModule);
    const configService = app.get(ConfigService);
    const GRPC_HOST = configService.get<string>('GRPC_HOST');
    const GRPC_PORT = configService.get<number>('GRPC_PORT');

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            url: `${GRPC_HOST}:${GRPC_PORT}`,
            package: 'user',
            protoPath: join(process.cwd(), 'proto', 'user.proto'),
        },
    });

    await app.init();
    await app.startAllMicroservices();

    await app.listen(configService.get<number>('HTTP_PORT'));
}
bootstrap();
