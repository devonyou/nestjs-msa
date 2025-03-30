import { Module } from '@nestjs/common';
import { PaymentQueryModule } from './payment/payment-query.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_DB_URL'),
            }),
        }),

        PaymentQueryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
