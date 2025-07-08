import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductCategoryEntity } from './entities/product.category.entity';
import { ProductImageEntity } from './entities/product.image.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { InventoryLogEntity } from './entities/inventory.log.entity';
import { StockReservationEntity } from './entities/stock.reservation.entity';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { S3Module } from '@app/common';

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
            }),
        }),

        TypeOrmModule.forFeature([
            ProductEntity,
            ProductCategoryEntity,
            ProductImageEntity,
            InventoryEntity,
            InventoryLogEntity,
            StockReservationEntity,
        ]),

        S3Module.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
                region: configService.getOrThrow<string>('AWS_REGION'),
                bucketName: configService.getOrThrow<string>('AWS_S3_BUCKET_NAME'),
            }),
        }),

        ProductModule,
        CategoryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
