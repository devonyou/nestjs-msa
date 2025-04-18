import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ProductModule } from './product/product.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                HTTP_PORT: Joi.number().required(),
                TCP_PORT: Joi.number().required(),
                GRPC_URL: Joi.string().required(),
                DB_URL: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                url: configService.get<string>('DB_URL'),
                autoLoadEntities: true,
                synchronize: true,
                ...(configService.get('NODE_ENV') === 'production' && {
                    ssl: {
                        rejectUnauthorized: false,
                    },
                }),
                logging: true,
            }),
        }),
        ProductModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
