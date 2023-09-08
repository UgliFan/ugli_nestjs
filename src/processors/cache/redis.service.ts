// https://github.com/nestjs/cache-manager/blob/master/lib/cache.module.ts
// https://github.com/nestjs/cache-manager/blob/master/lib/cache.providers.ts
// https://gist.github.com/kyle-mccarthy/b6770b49ebfab88e75bcbac87b272a94
import { createClient, RedisClientType } from 'redis';
import { Injectable } from '@nestjs/common';
import { createRedisStore, RedisStore, RedisClientOptions } from './redis.store';
import logger from '@app/utils/logger';
import { APP, REDIS } from '@app/configs/app.config';

const log = logger.scope('RedisService');

@Injectable()
export class RedisService {
  private redisStore!: RedisStore;
  private redisClient!: RedisClientType;

  constructor() {
    this.redisClient = createClient(this.getOptions()) as RedisClientType;
    this.redisStore = createRedisStore(this.redisClient, {
      defaultTTL: APP.DEFAULT_CACHE_TTL,
      namespace: REDIS.namespace,
    });
    // https://github.com/redis/node-redis#events
    this.redisClient.on('connect', () => log.info('connecting...'));
    this.redisClient.on('reconnecting', () => log.warn('reconnecting...'));
    this.redisClient.on('ready', () => log.info('readied (connected).'));
    this.redisClient.on('end', () => log.error('client end!'));
    this.redisClient.on('error', (error) => log.error(`client error!`, error.message));
    // connect
    this.redisClient.connect();
  }

  // https://github.com/redis/node-redis/blob/master/docs/client-configuration.md#reconnect-strategy
  private retryStrategy(retries: number): number | Error {
    const errorMessage = `retryStrategy! retries: ${retries}`;
    log.error(errorMessage);
    if (retries > 6) {
      return new Error('Redis maximum retries!');
    }
    return Math.min(retries * 1000, 3000);
  }

  // https://github.com/redis/node-redis/blob/master/docs/client-configuration.md
  private getOptions(): RedisClientOptions {
    const redisOptions: RedisClientOptions = {
      socket: {
        host: REDIS.host,
        port: REDIS.port as number,
        reconnectStrategy: this.retryStrategy.bind(this),
      },
    };
    if (REDIS.username) {
      redisOptions.username = REDIS.username;
    }
    if (REDIS.password) {
      redisOptions.password = REDIS.password;
    }

    return redisOptions;
  }

  public get client(): RedisClientType {
    return this.redisClient;
  }

  public get store(): RedisStore {
    return this.redisStore;
  }
}
