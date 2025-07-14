import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.modules';
import { RedisModule } from '@app/common';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        RedisModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    url: configService.getOrThrow<string>('REDIS_URL'),
                },
            }),
        }),

        MailModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
