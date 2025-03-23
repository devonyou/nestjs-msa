import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserMicroService } from '@app/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: UserMicroService.protobufPackage,
            protoPath: join(process.cwd(), 'proto', 'user.proto'),
            url: configService.get<string>('GRPC_URL'),
        },
    });

    await app.init();

    await app.startAllMicroservices();

    // await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
