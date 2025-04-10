import express from 'express';
import userRoutes from './user/user.routes';

const routes = express.Router();

routes.use('/', userRoutes);

export default routes;
