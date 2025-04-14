import { env } from './env';

export interface ServiceDependency {
  name: string;
  url: string;
  healthEndpoint: string;
  required: boolean;
}

export const serviceDependencies: ServiceDependency[] = [
  {
    name: 'user-service',
    url: env.USER_SERVICE_URL,
    healthEndpoint: '/health',
    required: true,
  },
  // {
  //   name: 'notification-service',
  //   url: env.NOTIFICATION_SERVICE_URL,
  //   healthEndpoint: '/health',
  //   required: false, // Optional dependency
  // },
  // Add more services as needed
];
