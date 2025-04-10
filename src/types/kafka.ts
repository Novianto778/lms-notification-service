import { Role } from '@prisma/client';

export interface UserCreatedEvent {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface KafkaMessage<T> {
  event: string;
  data: T;
  metadata: {
    timestamp: string;
    service: string;
  };
}
