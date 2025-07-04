import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule as NestRedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
    static forRootAsync(options: {
        useFactory: (...args: any[]) => RedisModuleOptions | Promise<RedisModuleOptions>;
        inject?: any[];
    }): DynamicModule {
        return {
            module: NestRedisModule,
            imports: [ConfigModule, NestRedisModule.forRootAsync(options)],
            providers: [RedisService],
            exports: [NestRedisModule, RedisService],
        };
    }
}
