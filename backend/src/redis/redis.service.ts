import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient();
    this.client.on('error', (error: unknown) => {
      console.error('Redis error:', error);
    });
  }

  async onModuleInit(): Promise<void> {
    this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.client.close();
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    try {
      const result = await this.client.set(key, JSON.stringify(value), {
        expiration: { type: 'EX', value: ttlSeconds },
      });
      if (!result) {
        console.warn(`Couldn't set key "${key}"" with value ${JSON.stringify(value)}`);
        return null;
      }
      console.debug(`Set key "${key}"" with TTL of ${ttlSeconds} seconds`);
      return result;
    } catch (error: unknown) {
      console.error(`Error setting cache key "${key}":`, error);
      return null;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        console.log(`Cache miss: Key "${key}" not found`);
        return null;
      }
      console.log(`Cache hit: Key "${key}" found`);
      return JSON.parse(value) as T;
    } catch (error: unknown) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }
}
