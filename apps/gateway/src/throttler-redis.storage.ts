import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      lazyConnect: true,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): Promise<{ totalHits: number; timeToExpire: number; isBlocked: boolean; timeToBlockExpire: number }> {
    const blockKey = `${key}:blocked`;

    const blocked = await this.redis.get(blockKey);
    if (blocked) {
      const blockTtl = await this.redis.pttl(blockKey);
      return {
        totalHits: limit + 1,
        timeToExpire: 0,
        isBlocked: true,
        timeToBlockExpire: Math.max(0, blockTtl),
      };
    }

    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.pttl(key);
    const results = await pipeline.exec();

    const totalHits = results[0][1] as number;
    let timeToExpire = results[1][1] as number;

    if (timeToExpire < 0) {
      await this.redis.pexpire(key, ttl);
      timeToExpire = ttl;
    }

    let isBlocked = false;
    let timeToBlockExpire = 0;

    if (totalHits > limit && blockDuration > 0) {
      await this.redis.set(blockKey, '1', 'PX', blockDuration);
      isBlocked = true;
      timeToBlockExpire = blockDuration;
    }

    return {
      totalHits,
      timeToExpire: Math.max(0, timeToExpire),
      isBlocked,
      timeToBlockExpire,
    };
  }
}
