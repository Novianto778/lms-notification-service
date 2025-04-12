import { Request, Response } from 'express';
import { handleServiceResponse } from '../../utils/httpHandlers';
import { authService } from './auth.service';
import { asyncWrapper } from '../../utils/asyncWrapper';

export class AuthController {
  public register = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await authService.register(req.body);
    handleServiceResponse(serviceResponse, res);
  });

  public login = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await authService.login(req.body);
    handleServiceResponse(serviceResponse, res);
  });

  public refresh = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await authService.refreshToken(req.body.refreshToken);
    handleServiceResponse(serviceResponse, res);
  });

  public logout = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await authService.logout(req.body.refreshToken);
    handleServiceResponse(serviceResponse, res);
  });
}

export const authController = new AuthController();
