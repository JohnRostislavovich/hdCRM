import { Request, Response } from 'express';
import { Service } from 'typedi';

import {
  BaseResponse,
  CollectionApiResponse,
  Role,
  ItemApiResponse,
  RequestWithBody,
  RequestWithQuery,
  CollectionQuery,
  RoleCreationAttributes
} from '../models';
import { RoleService } from '../services';
import { sendResponse } from './utils';

@Service()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  public async getDashboardData(
    req: Request,
    res: Response<CollectionApiResponse<Role> | BaseResponse>
  ): Promise<void> {
    const {
      user: { OrganizationId }
    } = req;
    const result = await this.roleService.getDashboardData(OrganizationId);

    return sendResponse<CollectionApiResponse<Role>, BaseResponse>(result, res);
  }

  public async getDataById(
    req: Request<{ id: string }>,
    res: Response<ItemApiResponse<Role> | BaseResponse>
  ): Promise<void> {
    const {
      params: { id }
    } = req;
    const result = await this.roleService.getDataById(id);

    return sendResponse<ItemApiResponse<Role>, BaseResponse>(result, res);
  }

  public async getPage(
    req: RequestWithQuery<CollectionQuery>,
    res: Response<CollectionApiResponse<Role> | BaseResponse>
  ): Promise<void> {
    const { pageSize, pageIndex, sortDirection, sortIndex } = req.query;
    const limit = parseInt(pageSize);
    const offset = parseInt(pageIndex) * limit;
    const OrganizationId = req.user.OrganizationId;

    const result = await this.roleService.getPage({
      sortDirection: sortDirection.toUpperCase(),
      sortIndex,
      limit,
      offset,
      OrganizationId
    });

    return sendResponse<CollectionApiResponse<Role>, BaseResponse>(result, res);
  }

  public async create(
    req: RequestWithBody<RoleCreationAttributes>,
    res: Response<ItemApiResponse<Role> | BaseResponse>
  ): Promise<void> {
    const role: RoleCreationAttributes = {
      ...req.body,
      OrganizationId: req.user.OrganizationId
    };
    const result = await this.roleService.create(role);

    return sendResponse<ItemApiResponse<Role>, BaseResponse>(result, res);
  }

  public async updateOne(
    req: RequestWithBody<Role>,
    res: Response<ItemApiResponse<Role> | BaseResponse>
  ): Promise<void> {
    const result = await this.roleService.updateOne(req.body);

    return sendResponse<ItemApiResponse<Role>, BaseResponse>(result, res);
  }

  public async delete(req: Request<{ id: string }>, res: Response<BaseResponse>): Promise<void> {
    const {
      params: { id }
    } = req;
    const result = await this.roleService.delete(id);

    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }
}
