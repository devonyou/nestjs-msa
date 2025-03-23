import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NotificationMicroService } from '@app/common';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: NotificationMicroService.protobufPackage,
            protoPath: join(process.cwd(), 'proto', 'notification.proto'),
            url: configService.get<string>('GRPC_URL'),
        },
    });

    await app.init();

    await app.startAllMicroservices();

    // await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
