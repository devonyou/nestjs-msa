import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './common/config/env.validation.schema';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                url: configService.getOrThrow<string>('MYSQL_URL'),
                autoLoadEntities: true,
                synchronize: configService.getOrThrow<string>('NODE_ENV') === 'development',
                logging: configService.getOrThrow<string>('NODE_ENV') === 'development',
                logger: 'advanced-console',
                entities: [PaymentEntity],
                timezone: 'Z',
            }),
        }),

        PaymentModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
