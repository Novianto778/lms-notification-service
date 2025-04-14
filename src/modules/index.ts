import express from 'express';
import courseRoutes from './course/course.routes';

const router = express.Router();

router.use('/courses', courseRoutes);

export default router;
