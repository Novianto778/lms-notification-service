import { cleanEnv, host, num, port, str, testOnly, bool } from 'envalid';
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
  JWT_SECRET: str({ default: 'your-access-token-secret' }),
  JWT_REFRESH_SECRET: str({ default: 'your-refresh-token-secret' }),
  JWT_EXPIRES_IN: str({ default: '15m' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),
  KAFKA_BROKER: str({ default: 'localhost:9092' }),
  USER_IDLE_TIMEOUT: num({ default: 900000 }), // 15 minutes in milliseconds
  SMTP_HOST: str({ default: 'smtp.gmail.com' }),
  SMTP_PORT: num({ default: 587 }),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: str(),
  SMTP_PASSWORD: str(),
  SMTP_FROM: str({ default: 'noreply@yourapp.com' }),
  CLIENT_URL: str({ default: 'http://localhost:3000' }),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: str({ default: '15m' }),
});
