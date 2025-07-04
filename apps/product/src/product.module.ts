import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';

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
            }),
        }),
    ],
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule {}
