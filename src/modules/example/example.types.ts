import { z } from 'zod';
import { exampleReturnSchema, exampleSchema, getAllExamplesQuerySchema } from './example.schema';

export type Example = z.infer<typeof exampleReturnSchema>;

export type ExampleCreate = z.infer<typeof exampleSchema>;

export type ExampleReturn = Example;

export type GetAllExamples = z.infer<typeof getAllExamplesQuerySchema>;
