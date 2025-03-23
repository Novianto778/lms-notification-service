import express from 'express';
import { validateRequest } from '../../middleware/validateMiddleware';
import {
  exampleSchema,
  getAllExamplesQuerySchema,
  getExampleByIdQuerySchema,
} from './example.schema';
import { exampleController } from './example.controller';

const router = express.Router();

// get all examples
router.get(
  '/',
  validateRequest({
    params: getAllExamplesQuerySchema,
  }),
  exampleController.getExample,
);

// create new example
router.post(
  '/',
  validateRequest({
    body: exampleSchema,
  }),
  exampleController.createExample,
);

// get example by id
router.get(
  '/:id',
  validateRequest({
    params: getExampleByIdQuerySchema,
  }),
  exampleController.getExampleById,
);

// update example by id
router.put(
  '/:id',
  validateRequest({
    params: getExampleByIdQuerySchema,
    body: exampleSchema,
  }),
  exampleController.updateExample,
);

// delete example by id
router.delete(
  '/:id',
  validateRequest({
    params: getExampleByIdQuerySchema,
  }),
  exampleController.deleteExample,
);

export default router;
