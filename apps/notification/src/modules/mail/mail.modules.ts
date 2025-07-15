import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const templateDir =
                    configService.getOrThrow<string>('NODE_ENV') === 'production'
                        ? path.join(process.cwd(), 'dist', 'template', 'mail')
                        : path.join(process.cwd(), 'apps', 'notification', 'src', 'template', 'mail');

                return {
                    transport: {
                        host: configService.getOrThrow<string>('MAIL_HOST'),
                        port: configService.getOrThrow<number>('MAIL_PORT'),
                        auth: {
                            user: configService.getOrThrow<string>('MAIL_USER'),
                            pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
                        },
                    },
                    defaults: {
                        from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_USER')}>`,
                    },
                    preview: true,
                    template: {
                        dir: templateDir,
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                };
            },
        }),
    ],
    controllers: [MailController],
    providers: [MailService],
})
export class MailModule {}
