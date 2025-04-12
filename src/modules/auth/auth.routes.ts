import express from 'express';
import { validateRequest } from '../../middleware/validateMiddleware';
import { authController } from './auth.controller';
import { loginUserSchema, refreshTokenSchema, registerUserSchema } from './auth.schema';

const router = express.Router();

router.post(
  '/register',
  validateRequest({
    body: registerUserSchema,
  }),
  authController.register,
);

router.post(
  '/login',
  validateRequest({
    body: loginUserSchema,
  }),
  authController.login,
);

router.post(
  '/refresh',
  validateRequest({
    body: refreshTokenSchema,
  }),
  authController.refresh,
);

router.post(
  '/logout',
  validateRequest({
    body: refreshTokenSchema,
  }),
  authController.logout,
);

export default router;
