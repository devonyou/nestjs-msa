import { Injectable, Logger } from '@nestjs/common';
import Redlock, { Lock } from 'redlock';

@Injectable()
export class RedisLockService {
    private readonly logger = new Logger(RedisLockService.name);

    constructor(private readonly redlock: Redlock) {}

    async acquireLock(resourceKey: string, ttl: number): Promise<Lock> {
        const lockResource = `locks:${resourceKey}`;
        return await this.redlock.acquire([lockResource], ttl * 1000);
    }

    async releaseLock(lock: Lock) {
        try {
            await lock.release();
        } catch (err) {
            this.logger.warn(`Failed to release lock: ${err.message}`);
        }
    }

    async runRedLock<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
        const lockResource = `locks:${key}`;

        let lock: Lock;

        try {
            lock = await this.redlock.acquire([lockResource], ttl * 1000);
            this.logger.debug(`Lock acquired for: ${lockResource}`);

            const result = await callback();

            await lock.release();
            this.logger.debug(`Lock released for: ${lockResource}`);

            return result;
        } catch (error) {
            this.logger.warn(`Lock error for ${lockResource}: ${error?.message}`);

            if (lock) {
                try {
                    await lock.release();
                } catch (releaseErr) {
                    this.logger.warn(`Lock release failed: ${releaseErr?.message}`);
                }
            }

            throw error;
        }
    }
}
