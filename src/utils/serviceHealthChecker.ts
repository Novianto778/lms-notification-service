import logger from '../config/logger';
import { ServiceDependency } from '../config/services';

export class ServiceHealthChecker {
  private retryAttempts: number;
  private retryInterval: number;

  constructor(retryAttempts: number, retryInterval: number) {
    this.retryAttempts = retryAttempts;
    this.retryInterval = retryInterval;
  }

  async checkService(service: ServiceDependency): Promise<boolean> {
    try {
      const response = await fetch(`${service.url}${service.healthEndpoint}`);
      return response.ok;
    } catch (error) {
      logger.error(`Failed to connect to ${service.name}:`, error);
      return false;
    }
  }

  async waitForService(service: ServiceDependency): Promise<boolean> {
    for (let i = 0; i < this.retryAttempts; i++) {
      logger.info(
        `Attempting to connect to ${service.name} (attempt ${i + 1}/${this.retryAttempts})`,
      );

      if (await this.checkService(service)) {
        logger.info(`Successfully connected to ${service.name}`);
        return true;
      }

      if (i < this.retryAttempts - 1) {
        logger.info(`Retrying ${service.name} in ${this.retryInterval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, this.retryInterval));
      }
    }

    if (service.required) {
      logger.error(
        `Failed to connect to required service ${service.name} after ${this.retryAttempts} attempts`,
      );
      return false;
    } else {
      logger.warn(`Optional service ${service.name} is not available`);
      return true;
    }
  }

  async checkAllServices(services: ServiceDependency[]): Promise<boolean> {
    const results = await Promise.all(
      services.map(async (service) => {
        const result = await this.waitForService(service);
        return { service, success: result };
      }),
    );

    const failedRequiredServices = results.filter(
      ({ service, success }) => service.required && !success,
    );

    if (failedRequiredServices.length > 0) {
      const failedServices = failedRequiredServices.map(({ service }) => service.name).join(', ');
      logger.error(`Failed to connect to required services: ${failedServices}`);
      return false;
    }

    return true;
  }
}
