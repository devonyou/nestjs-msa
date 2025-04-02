import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ThrottleInterceptor } from './common/interceptor/throttle.interceptor';
import { RedisService } from '@liaoliaots/nestjs-redis';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    const redisService = app.get(RedisService);
    app.useGlobalInterceptors(new ThrottleInterceptor(redisService));

    await app.init();

    await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
