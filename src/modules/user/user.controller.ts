import { Request, Response } from 'express';
import { handleServiceResponse } from '../../utils/httpHandlers';
import { userService } from './user.service';
import { asyncWrapper } from '../../utils/asyncWrapper';

class UserController {
  public register = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await userService.register(req.body);
    handleServiceResponse(serviceResponse, res);
  });

  public login = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await userService.login(req.body);
    handleServiceResponse(serviceResponse, res);
  });

  public getCurrentUser = asyncWrapper(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      const serviceResponse = {
        success: false,
        message: 'User not found',
        data: null,
        statusCode: 404,
      };
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const serviceResponse = await userService.findById(userId);
    handleServiceResponse(serviceResponse, res);
  });

  public getUserById = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await userService.findById(req.params.id);
    handleServiceResponse(serviceResponse, res);
  });

  public getAllUsers = asyncWrapper(async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  public getProfile = asyncWrapper(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      const serviceResponse = {
        success: false,
        message: 'User not found',
        data: null,
        statusCode: 404,
      };
      handleServiceResponse(serviceResponse, res);
      return;
    }

    const serviceResponse = await userService.getProfile(userId);
    handleServiceResponse(serviceResponse, res);
  });
}

export const userController = new UserController();
