import { Request, Response } from 'express';
import { asyncWrapper } from '../../utils/asyncWrapper';
import { handleServiceResponse } from '../../utils/httpHandlers';
import { courseService } from './course.service';

export class CourseController {
  public createCourse = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await courseService.createCourse(req.body, req.user!.id, req.file);
    handleServiceResponse(serviceResponse, res);
  });

  public getAllCourses = asyncWrapper(async (_req: Request, res: Response) => {
    const serviceResponse = await courseService.getAllCourses();
    handleServiceResponse(serviceResponse, res);
  });

  public getCourseById = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await courseService.getCourseById(req.params.id);
    handleServiceResponse(serviceResponse, res);
  });

  public enrollInCourse = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await courseService.enrollInCourse(req.user!.id, req.params.id);
    handleServiceResponse(serviceResponse, res);
  });

  public addModule = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await courseService.addModule(req.params.id, req.body);
    handleServiceResponse(serviceResponse, res);
  });

  public addSubModule = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await courseService.addSubModule(req.params.moduleId, req.body);
    handleServiceResponse(serviceResponse, res);
  });

  public addAttachment = asyncWrapper(async (req: Request, res: Response) => {
    const serviceResponse = await courseService.addAttachment(
      req.params.subModuleId,
      req.body.title,
      req.file!,
    );
    handleServiceResponse(serviceResponse, res);
  });
}

export const courseController = new CourseController();
