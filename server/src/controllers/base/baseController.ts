import { Request, Response } from 'express';
import qs from 'qs';
import { Inject } from 'typedi';
import { Model } from 'sequelize';

import { sendResponse } from '../utils';
import {
  BaseResponse,
  CollectionApiResponse,
  ItemApiResponse,
  RequestWithBody,
  RequestWithQuery,
  CollectionQuery,
  ParsedFilters
} from '../../models';
import { CONSTANTS } from '../../constants';
import { IBaseService } from '../../services/base/IBaseService';
import { CustomError } from '../../errors/custom-error';

export abstract class BaseController<C, A, M extends Model<A, C>> {
  protected readonly dataBaseService: IBaseService<C, A, M>;

  @Inject(CONSTANTS.MODELS_NAME)
  protected modelName: string;

  public async getByPk(req: Request<{ id: string }>, res: Response<ItemApiResponse<M> | CustomError>): Promise<void> {
    const {
      params: { id }
    } = req;
    req.log.info(`Selecting ${this.modelName} by id: ${id}...`);
    const result = await this.dataBaseService.getByPk(id);

    return sendResponse<ItemApiResponse<M>, CustomError>(result, res);
  }

  public async getPage(
    req: RequestWithQuery<CollectionQuery>,
    res: Response<CollectionApiResponse<M> | CustomError>
  ): Promise<void> {
    req.log.info(`Getting ${this.modelName} by page query...`);

    const { pageSize, pageIndex, sortDirection, sortIndex, filters } = req.query;
    const limit = parseInt(pageSize);
    const offset = parseInt(pageIndex) * limit;
    const OrganizationId = req.user.OrganizationId;

    const result = await this.dataBaseService.getPage(
      {
        sortDirection: sortDirection.toUpperCase(),
        sortIndex,
        limit,
        offset,
        parsedFilters: filters ? (qs.parse(filters) as ParsedFilters) : {}
      },
      // TODO: optional OrganizationId
      OrganizationId
    );

    return sendResponse<CollectionApiResponse<M>, CustomError>(result, res);
  }

  public async create(req: RequestWithBody<C>, res: Response<ItemApiResponse<M> | CustomError>): Promise<void> {
    req.log.info(`Creating new ${this.modelName}...`);

    const item: C = this.generateCreationAttributes(req);
    const result = await this.dataBaseService.create(item);

    return sendResponse<ItemApiResponse<M>, CustomError>(result, res);
  }

  public async update(req: RequestWithBody<A>, res: Response<ItemApiResponse<M> | CustomError>): Promise<void> {
    req.log.info(`Updating ${this.modelName} by id...`);

    const result = await this.dataBaseService.update(req.body);

    return sendResponse<ItemApiResponse<M>, CustomError>(result, res);
  }

  public async delete(req: Request<{ id: string }>, res: Response<BaseResponse | CustomError>): Promise<void> {
    const {
      params: { id }
    } = req;
    req.log.info(`Deleting ${this.modelName} by id: ${id}...`);
    const result = await this.dataBaseService.delete(id);

    return sendResponse<BaseResponse, CustomError>(result, res);
  }

  protected generateCreationAttributes(req: RequestWithBody<C>): C {
    return req.body;
  }
}
