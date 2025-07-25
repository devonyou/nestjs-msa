import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule as NestRedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { RedisService } from './redis.service';
import { RedisLockService } from './redis.lock.service';
import Redlock from 'redlock';

@Global()
@Module({})
export class RedisModule {
    static forRoot(options: RedisModuleOptions): DynamicModule {
        return {
            module: RedisModule,
            imports: [NestRedisModule.forRoot(options)],
            providers: [
                {
                    provide: Redlock,
                    inject: [RedisService],
                    useFactory: (redisService: RedisService) => {
                        return new Redlock([redisService.getClient()], {
                            retryCount: 3,
                            retryDelay: 200,
                            retryJitter: 100,
                        });
                    },
                },
                RedisService,
                RedisLockService,
            ],
            exports: [RedisService, RedisLockService],
        };
    }

    static forRootAsync(options: {
        useFactory: (...args: any[]) => RedisModuleOptions | Promise<RedisModuleOptions>;
        inject?: any[];
    }): DynamicModule {
        return {
            module: RedisModule,
            imports: [ConfigModule, NestRedisModule.forRootAsync(options)],
            providers: [
                {
                    provide: Redlock,
                    inject: [RedisService],
                    useFactory: (redisService: RedisService) => {
                        return new Redlock([redisService.getClient()], {
                            retryCount: 3,
                            retryDelay: 200,
                            retryJitter: 100,
                        });
                    },
                },
                RedisService,
                RedisLockService,
            ],
            exports: [RedisService, RedisLockService],
        };
    }
}
