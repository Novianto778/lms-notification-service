import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from '../../model/errorModel';
import { ServiceResponse } from '../../model/serviceResponse';
import { UserRepository } from './user.repository';
import { LoginUser, RegisterUser, UserReturn } from './user.types';
import { userReturnSchema } from './user.schema';
import redis from '../../config/redis';
import { JWTPayload } from '../../types/express';
import { env } from '../../config/env';
import { kafkaProducer } from '../../config/kafka';
import { KAFKA_TOPICS } from '../../constants/kafka';
import { KafkaMessage, UserCreatedEvent } from '../../types/kafka';

export class UserService {
  private userRepository: UserRepository;
  private readonly CACHE_TTL = 3600;
  private readonly CACHE_KEY_PREFIX = 'user:';

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  private getCacheKey(id: string): string {
    return `${this.CACHE_KEY_PREFIX}${id}`;
  }

  private generateToken(user: UserReturn): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
  }

  private async publishUserCreated(user: UserReturn): Promise<void> {
    const event: KafkaMessage<UserCreatedEvent> = {
      event: KAFKA_TOPICS.USER_CREATED,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        service: 'user-service',
      },
    };

    await kafkaProducer.produce(KAFKA_TOPICS.USER_CREATED, event);
  }

  async register(userData: RegisterUser): Promise<ServiceResponse<{ userId: string }>> {
    const existingUser = await this.userRepository.findByEmailAsync(userData.email);
    if (existingUser) {
      throw new AppError('Email already registered', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userRepository.createAsync({
      ...userData,
      password: hashedPassword,
    });

    // Publish user.created event
    await this.publishUserCreated(user);

    return ServiceResponse.success(
      'User registered successfully',
      { userId: user.id },
      StatusCodes.CREATED,
    );
  }

  async login(credentials: LoginUser): Promise<ServiceResponse<{ token: string }>> {
    const user = await this.userRepository.findByEmailAsync(credentials.email);
    if (!user) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const token = this.generateToken(user);
    return ServiceResponse.success('Login successful', { token });
  }

  async findById(id: string): Promise<ServiceResponse<UserReturn>> {
    const cacheKey = this.getCacheKey(id);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const user = JSON.parse(cached);
      return ServiceResponse.success('User found (cached)', user);
    }

    const user = await this.userRepository.findByIdAsync(id);
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    const res = userReturnSchema.safeParse(user);
    if (!res.success) {
      throw new AppError('Invalid user data', StatusCodes.BAD_REQUEST);
    }

    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(res.data));
    return ServiceResponse.success('User found', res.data);
  }

  async findAll(): Promise<ServiceResponse<UserReturn[]>> {
    const users = await this.userRepository.findAllAsync();

    const parsedUsers = users.map((user) => {
      const res = userReturnSchema.safeParse(user);
      if (!res.success) {
        throw new AppError('Invalid user data', StatusCodes.BAD_REQUEST);
      }
      return res.data;
    });

    return ServiceResponse.success('Users retrieved successfully', parsedUsers);
  }

  async getProfile(userId: string): Promise<ServiceResponse<UserReturn>> {
    const user = await this.findById(userId);
    return ServiceResponse.success('User profile retrieved successfully', user.data);
  }
}

export const userService = new UserService();
