import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PaymentMicroService } from '@app/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            package: PaymentMicroService.protobufPackage,
            protoPath: join(process.cwd(), 'proto', 'payment.proto'),
            url: configService.get<string>('GRPC_URL'),
        },
    });

    await app.init();

    await app.startAllMicroservices();
    // await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
