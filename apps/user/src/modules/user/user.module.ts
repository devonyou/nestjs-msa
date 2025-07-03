import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from '../../common/config/env.validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from '@app/common';

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
                url: configService.get('MYSQL_URL'),
                autoLoadEntities: true,
                synchronize: configService.get<string>('NODE_ENV') === 'development',
                logging: configService.get<string>('NODE_ENV') === 'development',
            }),
        }),

        TypeOrmModule.forFeature([UserEntity]),

        RedisModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    url: configService.get('REDIS_URL'),
                },
            }),
        }),

        forwardRef(() => AuthModule),
    ],
    controllers: [UserController],
    providers: [UserService, JwtService],
    exports: [UserService],
})
export class UserModule {}
