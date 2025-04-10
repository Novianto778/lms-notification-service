import express from 'express';
import { validateRequest } from '../../middleware/validateMiddleware';
import { authenticateToken, authorizeRoles } from '../../middleware/authMiddleware';
import { registerUserSchema, loginUserSchema, getUserByIdParamsSchema } from './user.schema';
import { userController } from './user.controller';
import { Role } from '@prisma/client';

const router = express.Router();

// Auth routes
router.post(
  '/auth/register',
  validateRequest({
    body: registerUserSchema,
  }),
  userController.register,
);

router.post(
  '/auth/login',
  validateRequest({
    body: loginUserSchema,
  }),
  userController.login,
);

// User routes
router.get('/users', authenticateToken, authorizeRoles(Role.admin), userController.getAllUsers);

router.get('/users/me', authenticateToken, userController.getProfile);

router.get(
  '/users/:id',
  authenticateToken,
  validateRequest({
    params: getUserByIdParamsSchema,
  }),
  userController.getUserById,
);

export default router;
