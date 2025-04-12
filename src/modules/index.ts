import express from 'express';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
