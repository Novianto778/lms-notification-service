import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../model/errorModel';
import { ServiceResponse } from '../../model/serviceResponse';
import { ExampleRepository } from './example.repository';
import { Example, ExampleCreate, ExampleReturn, GetAllExamples } from './example.types';
import { exampleReturnSchema } from './example.schema';
import redis from '../../config/redis';

export class ExampleService {
  private exampleRepository: ExampleRepository;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_KEY_PREFIX = 'example:';

  constructor(repository: ExampleRepository = new ExampleRepository()) {
    this.exampleRepository = repository;
  }

  private getCacheKey(id?: number, queryParams?: GetAllExamples): string {
    if (id) {
      return `${this.CACHE_KEY_PREFIX}${id}`;
    }
    return `${this.CACHE_KEY_PREFIX}list:${JSON.stringify(queryParams)}`;
  }

  private async clearCache(): Promise<void> {
    const keys = await redis.keys(`${this.CACHE_KEY_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Retrieves all examples
  async findAll(queryParams: GetAllExamples): Promise<ServiceResponse<Example[] | null>> {
    const cacheKey = this.getCacheKey(undefined, queryParams);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const examples = JSON.parse(cached);
      return ServiceResponse.success<Example[]>('Examples found (cached)', examples);
    }

    const examples = await this.exampleRepository.findAllAsync(queryParams);
    if (!examples || examples.length === 0) {
      return ServiceResponse.success<Example[]>('No examples found', []);
    }

    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(examples));
    return ServiceResponse.success<Example[]>('Examples found', examples);
  }

  // Retrieves a single example by ID
  async findById(id: number): Promise<ServiceResponse<ExampleReturn | null>> {
    const cacheKey = this.getCacheKey(id);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const example = JSON.parse(cached);
      return ServiceResponse.success<ExampleReturn>('Example found (cached)', example);
    }

    const example = await this.exampleRepository.findByIdAsync(id);
    if (!example) {
      throw new AppError('Example not found', StatusCodes.NOT_FOUND);
    }

    const res = exampleReturnSchema.safeParse(example);
    if (res.error) {
      throw new AppError('Invalid example data', StatusCodes.BAD_REQUEST);
    }

    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(res.data));
    return ServiceResponse.success<ExampleReturn>('Example found', res.data);
  }

  // Creates a new example
  async create(example: ExampleCreate): Promise<ServiceResponse<Example>> {
    const newExample = await this.exampleRepository.createAsync(example);
    await this.clearCache();
    return ServiceResponse.success<Example>('Example created', newExample, StatusCodes.CREATED);
  }

  // Updates an existing example
  async update(id: number, example: ExampleCreate): Promise<ServiceResponse<Example | null>> {
    const updatedExample = await this.exampleRepository.updateAsync(id, example);
    if (!updatedExample) {
      throw new AppError('Example not found', StatusCodes.NOT_FOUND);
    }
    await this.clearCache();
    return ServiceResponse.success<Example>('Example updated', updatedExample);
  }

  // Deletes an example
  async delete(id: number): Promise<ServiceResponse<Example | null>> {
    const deletedExample = await this.exampleRepository.deleteAsync(id);
    if (!deletedExample) {
      throw new AppError('Example not found', StatusCodes.NOT_FOUND);
    }
    await this.clearCache();
    return ServiceResponse.success<Example>('Example deleted', deletedExample);
  }
}

export const exampleService = new ExampleService();
