import { Request, Response } from 'express';
import { Service } from 'typedi';

import {
  BaseResponse,
  CollectionApiResponse,
  RequestWithBody,
  Task,
  TaskAttributes,
  TaskCreationAttributes,
  TaskPriority
} from '../models';
import { TaskService } from '../services';
import { BaseController } from './base/BaseController';
import { sendResponse } from './utils';

@Service()
export class TaskController extends BaseController<TaskCreationAttributes, TaskAttributes, Task> {
  constructor(readonly taskService: TaskService) {
    super();
  }

  public async getAll(req: Request, res: Response<CollectionApiResponse<Task> | BaseResponse>): Promise<void> {
    const creatorId = req.user.id;
    req.log.info(`Selecting all tasks...`);

    const result = await this.taskService.getAll(creatorId);

    return sendResponse<CollectionApiResponse<Task>, BaseResponse>(result, res);
  }

  public async deleteMultiple(req: RequestWithBody<{ taskIds: number[] }>, res: Response<BaseResponse>): Promise<void> {
    const {
      body: { taskIds }
    } = req;
    req.log.info(`Deleting tasks by id: ${taskIds}...`);
    const result = await this.taskService.delete(taskIds);

    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }

  public async getPrioriities(req: Request, res: Response<CollectionApiResponse<TaskPriority>>): Promise<void> {
    req.log.info(`Selecting all tasks...`);

    const result = await this.taskService.getPriorities();

    return sendResponse<CollectionApiResponse<TaskPriority>, BaseResponse>(result, res);
  }

  public generateCreationAttributes(req: RequestWithBody<TaskCreationAttributes>): TaskCreationAttributes {
    return {
      ...req.body,
      CreatorId: req.user.id
    };
  }
}
