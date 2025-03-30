import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClientProvider, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'payment-query',
                brokers: ['kafka:9092'],
            },
            consumer: {
                groupId: 'payment-update-consumer',
            },
        },
    } as ClientProvider);

    await app.init();

    await app.startAllMicroservices();

    await app.listen(process.env.port ?? 3000);
}
bootstrap();
