import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.modules';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        MailModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
