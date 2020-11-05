import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { JwtHelper } from '../helpers/jwtHelper';

import {
  BaseResponse,
  OrganizationCreationAttributes,
  PasswordReset,
  RequestWithBody,
  UserCreationAttributes
} from '../models';
import { AuthService, UserService } from '../services';
import { Crypt } from '../utils/crypt';
import { parseCookies } from '../utils/parseCookies';
import { sendResponse } from './utils';

@Service()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly crypt: Crypt,
    private readonly jwtHelper: JwtHelper
  ) {}

  public async register(req: Request, res: Response<BaseResponse>): Promise<void> {
    const password = req.body.password ? req.body.password : this.crypt.genRandomString(12);
    const passwordData = this.crypt.saltHashPassword(password);

    const OrgDefaults: any = {
      Roles: [
        {
          keyString: 'admin'
        }
      ]
    };

    const organization: OrganizationCreationAttributes = {
      ...OrgDefaults,
      ...req.body.Organization,
      ...(!req.body.Organization.title && { title: `PRIVATE_ORG_FOR_${req.body.name}_${req.body.surname}` })
    };

    const user: UserCreationAttributes = {
      email: req.body.email,
      login: req.body.login,
      passwordHash: passwordData.passwordHash,
      salt: passwordData.salt,
      name: req.body.name,
      surname: req.body.surname,
      defaultLang: 'en',
      phone: req.body.phone
    };

    const result = await this.authService.register({ organization, user, password });

    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }

  public async activateAccount(req: RequestWithBody<{ token: string }>, res: Response<BaseResponse>): Promise<void> {
    const { token } = req.body;

    const result = await this.authService.activateAccount(token);

    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }

  public async authenticate(
    req: RequestWithBody<{ login: string; password: string }>,
    res: Response<string | BaseResponse>
  ): Promise<void> {
    const loginOrEmail = req.body.login;
    const password = req.body.password;
    const result = await this.authService.authenticate({
      loginOrEmail,
      password,
      connection: {
        IP: req.ip,
        UA: req.headers['user-agent']
      }
    });

    return result.match<void>(
      (body) => {
        // set cookie for one year, it doest matter, because it has token that itself has an expiration date;
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        res.cookie('refresh_token', body.refreshToken, { httpOnly: true, expires });
        res.status(StatusCodes.OK);
        res.json(`JWT ${body.accessToken}`);
      },
      (error) => {
        res.status(StatusCodes.BAD_REQUEST);
        res.send(error);
      }
    );
  }

  public async refreshSession(req: Request, res: Response<BaseResponse | string>): Promise<void> {
    const cookies = parseCookies(req) as any;

    const result = await this.authService.refreshSession(cookies.refresh_token);

    return result.match<void>(
      (body) => {
        res.status(StatusCodes.OK);
        res.json(`JWT ${body.accessToken}`);
      },
      (error) => {
        res.status(StatusCodes.BAD_REQUEST);
        res.send(error);
      }
    );
  }

  public async logout(req: Request, res: Response<BaseResponse>): Promise<void> {
    // Logger.Info(`Logging user out...`);
    const cookies = parseCookies(req) as any;
    const decodedResult = this.jwtHelper.getDecoded(cookies.refresh_token);
    if (decodedResult.isOk()) {
      await this.userService.removeSession(decodedResult.value.sessionId);
    }
    // force cookie expiration
    const expires = new Date(1970);
    res.cookie('refresh_token', null, { httpOnly: true, expires });
    req.logout();
    res.status(StatusCodes.OK).json({ success: true, message: 'logged out' });
  }

  public async forgotPassword(req: Request, res: Response<BaseResponse>): Promise<void> {
    const loginOrEmail = req.body.login;

    const result = await this.authService.forgotPassword(loginOrEmail);
    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }

  public async resetPassword(req: RequestWithBody<PasswordReset>, res: Response<BaseResponse>): Promise<void> {
    const result = await this.authService.resetPassword(req.body);
    return sendResponse<BaseResponse, BaseResponse>(result, res);
  }
}
