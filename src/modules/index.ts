import express from 'express';
import exampleRoutes from './example/example.routes';

const router = express.Router();

// Register module routes
router.use('/example', exampleRoutes);

export default router;
