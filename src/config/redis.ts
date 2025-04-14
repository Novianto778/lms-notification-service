import Redis from 'ioredis';
import { env } from './env';

const redis = new Redis({
  host: env.REDIS_HOST || 'localhost',
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
});

redis.on('connect', () => console.log('🚀 Connected to Redis'));
redis.on('error', (err) => console.error('❌ Redis error:', err));

export default redis;
