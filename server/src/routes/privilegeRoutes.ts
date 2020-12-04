import { Response, Router } from 'express';
import { Service } from 'typedi';

import {
  Privilege,
  RequestWithBody,
  CollectionApiResponse,
  ItemApiResponse,
  PrivilegeCreationAttributes
} from '../models';
import { PrivilegeController } from '../controllers';

@Service()
export class PrivilegeRoutes {
  private router: Router = Router();

  constructor(private readonly privilegeController: PrivilegeController) {}

  public register(): Router {
    this.router.post(
      '/',
      async (req: RequestWithBody<PrivilegeCreationAttributes>, res: Response<ItemApiResponse<Privilege>>) =>
        this.privilegeController.create(req, res)
    );

    this.router.get('/', async (req, res: Response<CollectionApiResponse<Privilege>>) =>
      this.privilegeController.getAll(req, res)
    );

    return this.router;
  }
}
