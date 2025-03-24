import { Example, ExampleCreate, GetAllExamples } from './example.types';
import prisma from '../../config/prisma';

export class ExampleRepository {
  async findAllAsync(queryParams: GetAllExamples): Promise<Example[]> {
    const { limit = 10, offset = 0, name, email } = queryParams;

    return await prisma.example.findMany({
      where: {
        ...(name && {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        }),
        ...(email && {
          email: {
            contains: email,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async findByIdAsync(id: number): Promise<Example | null> {
    return await prisma.example.findUnique({
      where: { id },
    });
  }

  async createAsync(data: ExampleCreate): Promise<Example> {
    return await prisma.example.create({
      data: {
        ...data,
      },
    });
  }

  async updateAsync(id: number, data: ExampleCreate): Promise<Example | null> {
    return await prisma.example.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteAsync(id: number): Promise<Example | null> {
    return await prisma.example.delete({
      where: { id },
    });
  }
}

export const exampleRepository = new ExampleRepository();
