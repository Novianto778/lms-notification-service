import { HelmetOptions } from 'helmet';
import { env } from './env';

export const securityConfig: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        env.CORS_ORIGIN,
        // Add WebSocket URL if different from main origin
        env.CORS_ORIGIN.replace('http', 'ws'),
        env.CORS_ORIGIN.replace('https', 'wss'),
      ],
      scriptSrc: [
        "'self'",
        // Add any trusted script sources
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // If needed for your UI
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:', // If you need to load images from any HTTPS source
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: env.NODE_ENV === 'development', // Only report violations in development
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: {
    policy: env.NODE_ENV === 'production' ? 'same-site' : 'cross-origin',
  },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};
