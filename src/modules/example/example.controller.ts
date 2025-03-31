import { Request, Response, RequestHandler } from 'express';
import { parseQueryOrParams } from '../../utils/queryParams';

import { handleServiceResponse } from '../../utils/httpHandlers';
import { exampleService } from './example.service';
import { GetAllExamples } from './example.types';

class ExampleController {
  public getExample: RequestHandler = async (req: Request, res: Response) => {
    const queryParams = parseQueryOrParams<GetAllExamples>(req.query);

    const serviceResponse = await exampleService.findAll(queryParams);
    handleServiceResponse(serviceResponse, res);
  };

  public createExample: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await exampleService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };

  public getExampleById: RequestHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const serviceResponse = await exampleService.findById(id);
    handleServiceResponse(serviceResponse, res);
  };

  public updateExample: RequestHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const serviceResponse = await exampleService.update(id, req.body);
    handleServiceResponse(serviceResponse, res);
  };

  public deleteExample: RequestHandler = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const serviceResponse = await exampleService.delete(id);
    handleServiceResponse(serviceResponse, res);
  };
}

export const exampleController = new ExampleController();
