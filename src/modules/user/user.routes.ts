import { Role } from '@prisma/client';
import express from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateMiddleware';
import { userController } from './user.controller';
import { getUserByIdParamsSchema } from './user.schema';

const router = express.Router();

// // Auth routes
// router.post(
//   '/auth/register',
//   validateRequest({
//     body: registerUserSchema,
//   }),
//   userController.register,
// );

// router.post(
//   '/auth/login',
//   validateRequest({
//     body: loginUserSchema,
//   }),
//   userController.login,
// );

// User routes
router.get('/', authenticateToken, authorizeRoles(Role.admin), userController.getAllUsers);

router.get('/me', authenticateToken, userController.getProfile);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles(Role.admin),
  validateRequest({
    params: getUserByIdParamsSchema,
  }),
  userController.getUserById,
);

export default router;
