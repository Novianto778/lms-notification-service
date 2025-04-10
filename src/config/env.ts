import { cleanEnv, host, num, port, str, testOnly } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3000') }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  REDIS_HOST: str({ devDefault: testOnly('localhost') }),
  REDIS_PORT: num({ devDefault: testOnly(6379) }),
  REDIS_PASSWORD: str({ default: undefined }),
  DATABASE_URL: str(),
  JWT_SECRET: str({ default: 'your-secret-key' }),
  JWT_EXPIRES_IN: str({ default: '24h' }),
  KAFKA_BROKER: str({ default: 'localhost:9092' }),
});
