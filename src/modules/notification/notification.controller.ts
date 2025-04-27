import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { asyncWrapper } from '../../utils/asyncWrapper';
import { handleServiceResponse } from '../../utils/httpHandlers';
import { sseManager } from '../../config/sseManager';

export class NotificationController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService = new NotificationService()) {
    this.notificationService = notificationService;
  }

  public getUserNotifications = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await this.notificationService.getUserNotifications(
      req.user!.id,
      req.query,
    );
    handleServiceResponse(serviceResponse, res);
  });

  public markAsRead = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await this.notificationService.markAsRead(req.user!.id, req.params.id);
    handleServiceResponse(serviceResponse, res);
  });

  public updateNotification = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await this.notificationService.updateNotification(
      req.user!.id,
      req.params.id,
      req.body,
    );
    handleServiceResponse(serviceResponse, res);
  });
}

export const notificationController = new NotificationController();

export const streamNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  sseManager.addClient(userId, res);
};
