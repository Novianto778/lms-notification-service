import { Example, ExampleCreate, GetAllExamples } from './example.types';

// Dummy data
const examples: Example[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export class ExampleRepository {
  private data: Example[] = examples;
  private nextId = this.data.length + 1;

  async findAllAsync(queryParams: GetAllExamples): Promise<Example[]> {
    const { limit = 10, offset = 0, name, email } = queryParams;

    let filtered = [...this.data];

    if (name) {
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (email) {
      filtered = filtered.filter((ex) => ex.email.toLowerCase().includes(email.toLowerCase()));
    }

    return filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async findByIdAsync(id: number): Promise<Example | null> {
    return this.data.find((ex) => ex.id === id) || null;
  }

  async createAsync(data: ExampleCreate): Promise<Example> {
    const newExample: Example = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.push(newExample);
    return newExample;
  }

  async updateAsync(id: number, data: ExampleCreate): Promise<Example | null> {
    const index = this.data.findIndex((ex) => ex.id === id);
    if (index === -1) return null;

    const updatedExample: Example = {
      ...this.data[index],
      ...data,
      updatedAt: new Date(),
    };

    this.data[index] = updatedExample;
    return updatedExample;
  }

  async deleteAsync(id: number): Promise<Example | null> {
    const index = this.data.findIndex((ex) => ex.id === id);
    if (index === -1) return null;

    const [deletedExample] = this.data.splice(index, 1);
    return deletedExample;
  }
}

export const exampleRepository = new ExampleRepository();
