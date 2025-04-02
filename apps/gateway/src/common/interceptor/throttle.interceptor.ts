import { RedisService } from '@liaoliaots/nestjs-redis';
import {
    CallHandler,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Observable } from 'rxjs';

@Injectable()
export class ThrottleInterceptor {
    private redis: Redis;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getOrThrow();
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const ip = req.ip;
        const minute = new Date().getMinutes();
        const key = `${req.method}_${req.path}_${ip}_${minute}`;
        const limit = 5;
        const ttl = 60;

        const count = +(await this.redis.get(key)) || 0;

        if (count >= limit) {
            throw new ForbiddenException(
                'Too many requests, please try again later.',
            );
        }

        if (count === 0) {
            await this.redis.setex(key, ttl, 1);
        } else {
            await this.redis.set(key, count + 1);
        }

        return next.handle();
    }
}
