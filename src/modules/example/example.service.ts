import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../model/errorModel';
import { ServiceResponse } from '../../model/serviceResponse';
import { ExampleRepository } from './example.repository';
import { Example, ExampleCreate, ExampleReturn, GetAllExamples } from './example.types';
import { exampleReturnSchema } from './example.schema';

export class ExampleService {
  private exampleRepository: ExampleRepository;

  constructor(repository: ExampleRepository = new ExampleRepository()) {
    this.exampleRepository = repository;
  }

  // Retrieves all examples
  async findAll(queryParams: GetAllExamples): Promise<ServiceResponse<Example[] | null>> {
    const examples = await this.exampleRepository.findAllAsync(queryParams);
    if (!examples || examples.length === 0) {
      return ServiceResponse.success<Example[]>('No examples found', []);
    }
    return ServiceResponse.success<Example[]>('Examples found', examples);
  }

  // Retrieves a single example by ID
  async findById(id: number): Promise<ServiceResponse<ExampleReturn | null>> {
    const example = await this.exampleRepository.findByIdAsync(id);
    if (!example) {
      throw new AppError('Example not found', StatusCodes.NOT_FOUND);
    }

    const res = exampleReturnSchema.safeParse(example);
    if (res.error) {
      throw new AppError('Invalid example data', StatusCodes.BAD_REQUEST);
    }

    return ServiceResponse.success<ExampleReturn>('Example found', res.data);
  }

  // Creates a new example
  async create(example: ExampleCreate): Promise<ServiceResponse<Example>> {
    const newExample = await this.exampleRepository.createAsync(example);
    return ServiceResponse.success<Example>('Example created', newExample, StatusCodes.CREATED);
  }

  // Updates an existing example
  async update(id: number, example: ExampleCreate): Promise<ServiceResponse<Example | null>> {
    const updatedExample = await this.exampleRepository.updateAsync(id, example);
    if (!updatedExample) {
      throw new AppError('Example not found', StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<Example>('Example updated', updatedExample);
  }

  // Deletes an example
  async delete(id: number): Promise<ServiceResponse<Example | null>> {
    const deletedExample = await this.exampleRepository.deleteAsync(id);
    if (!deletedExample) {
      throw new AppError('Example not found', StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<Example>('Example deleted', deletedExample);
  }
}

export const exampleService = new ExampleService();
