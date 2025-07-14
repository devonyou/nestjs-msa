import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './modules/order/order.module';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClient } from './common/grpc/grpc.client';
import { rmqClient } from './common/rmq/queue.client';
import { RedisModule } from '@app/common';
import { OrderDeliveryEntity } from './entitites/order.delivery.entity';
import { OrderEntity } from './entitites/order.entity';
import { OrderItemEntity } from './entitites/order.item.entity';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        ClientsModule.registerAsync({
            isGlobal: true,
            clients: [...grpcClient, ...rmqClient],
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
                entities: [OrderEntity, OrderItemEntity, OrderDeliveryEntity],
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

        OrderModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
