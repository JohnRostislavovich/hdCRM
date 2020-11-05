import { Request, Response } from 'express';
import { Service } from 'typedi';

import {
  BaseResponse,
  CollectionApiResponse,
  ItemApiResponse,
  RequestWithBody,
  Task,
  TaskCreationAttributes,
  TaskPriority
} from '../models';
import { TaskService } from '../services';
import { sendResponse } from './utils';

@Service()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  public async getAll(req: Request, res: Response<CollectionApiResponse<Task> | BaseResponse>): Promise<void> {
    const creatorId = req.user.id;
    const result = await this.taskService.getAll(creatorId);

    return sendResponse<CollectionApiResponse<Task>, BaseResponse>(result, res);
  }

  public async create(
    req: RequestWithBody<TaskCreationAttributes>,
    res: Response<ItemApiResponse<Task> | BaseResponse>
  ): Promise<void> {
    const task: TaskCreationAttributes = {
      ...req.body,
      CreatorId: req.user.id
    };
    const result = await this.taskService.create(task);

    return sendResponse<ItemApiResponse<Task>, BaseResponse>(result, res);
  }

  public async updateOne(
    req: RequestWithBody<Task>,
    res: Response<ItemApiResponse<Task> | BaseResponse>
  ): Promise<void> {
    const result = await this.taskService.updateOne(req.body);

    return sendResponse<ItemApiResponse<Task>, BaseResponse>(result, res);
  }

  public async delete(req: Request<{ id: string }>, res: Response<BaseResponse>): Promise<void> {
    const {
      params: { id }
    } = req;
    const result = await this.taskService.delete(id);

    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }

  public async deleteMultiple(req: RequestWithBody<{ taskIds: number[] }>, res: Response<BaseResponse>): Promise<void> {
    const {
      body: { taskIds }
    } = req;
    const result = await this.taskService.delete(taskIds);

    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }

  public async getPrioriities(res: Response<CollectionApiResponse<TaskPriority>>): Promise<void> {
    const result = await this.taskService.getPriorities();

    return sendResponse<CollectionApiResponse<TaskPriority>, BaseResponse>(result, res);
  }
}
