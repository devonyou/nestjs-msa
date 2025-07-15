import { Injectable } from '@nestjs/common';
import { RedisService as NestRedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly redis: Redis;

    constructor(private readonly nestRedisService: NestRedisService) {
        this.redis = nestRedisService.getOrThrow();
    }

    getClient(): Redis {
        return this.redis;
    }

    async set<T = any>(key: string, value: T, ttl?: number) {
        const data = JSON.stringify(value);
        ttl ? await this.redis.set(key, data, 'EX', ttl) : await this.redis.set(key, data);
    }

    async get<T = any>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async del(key: string) {
        await this.redis.del(key);
    }

    async ttl(key: string): Promise<number> {
        return await this.redis.ttl(key);
    }

    // async acquireLock(lockKey: string, lockValue: string, ttl: number) {
    //     const acquired = await this.redis.set(lockKey, lockValue, 'EX', ttl, 'NX');
    //     return acquired === 'OK';
    // }

    // async releaseLock(lockKey: string, lockValue: string) {
    //     const script = `
    //         if redis.call("get", KEYS[1]) == ARGV[1] then
    //             return redis.call("del", KEYS[1])
    //         else
    //             return 0
    //         end
    //     `;
    //     const result = await this.redis.eval(script, 1, [lockKey, lockValue]);
    //     return result === 1;
    // }
}
