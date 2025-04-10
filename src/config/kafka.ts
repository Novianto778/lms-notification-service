import { Kafka, Producer } from 'kafkajs';
import { env } from './env';
import logger from './logger';

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: [env.KAFKA_BROKER],
});

class KafkaProducer {
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('🚀 Connected to Kafka');
    } catch (error) {
      console.error('❌ Error connecting to Kafka:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('👋 Disconnected from Kafka');
    } catch (error) {
      console.error('❌ Error disconnecting from Kafka:', error);
      throw error;
    }
  }

  async produce(topic: string, message: any): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      logger.info(`Producing message to topic ${topic}:`, message);

      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });
    } catch (error) {
      console.error(`❌ Error producing message to topic ${topic}:`, error);
      throw error;
    }
  }
}

export const kafkaProducer = new KafkaProducer();
