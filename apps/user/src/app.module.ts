import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@app/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { UserEntity } from './entities/user.entity';

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
                entities: [UserEntity],
                timezone: 'Z',
            }),
        }),

        RedisModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    url: configService.getOrThrow<string>('REDIS_URL'),
                },
            }),
        }),

        AuthModule,
        UserModule,
    ],
})
export class AppModule {}
