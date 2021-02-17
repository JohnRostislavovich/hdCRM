import Container, { Service } from 'typedi';
import { Op, IncludeOptions } from 'sequelize';
import { err, ok, Result } from 'neverthrow';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import {
  User,
  UserSession,
  Role,
  Organization,
  UserCreationAttributes,
  UserAttributes,
  OrganizationAttributes,
  Asset,
  ItemApiResponse,
  BaseResponse,
  CollectionApiResponse,
  PasswordReset,
  AssetCreationAttributes,
  ErrorOrigin
} from '../models';
import { CONSTANTS, MailThemes } from '../constants';
import { Mailer } from '../mailer/nodeMailerTemplates';
import { Crypt } from '../utils/crypt';
import { Config } from '../config';
import { reduceResults } from './utils';
import { BaseService } from './base/baseService';

@Service()
export class UserService extends BaseService<UserCreationAttributes, UserAttributes, User> {
  private unlinkAsync = promisify(fs.unlink);
  public excludes: string[] = ['passwordHash', 'salt'];
  public readonly includes: IncludeOptions[] = [
    {
      association: User.associations.Role,
      required: false,
      include: [
        {
          association: Role.associations.Privileges,
          through: {
            attributes: ['view', 'edit', 'add', 'delete']
          },
          required: false
        }
      ]
    },
    {
      association: User.associations.UserSessions
    },
    {
      association: User.associations.Preference,
      required: false
    },
    {
      association: User.associations.PasswordAttributes,
      attributes: ['updatedAt', 'passwordExpire'],
      required: false
    },
    {
      association: User.associations.avatar
    },
    {
      association: User.associations.Department,
      required: false
    },
    {
      association: User.associations.Organization
    }
  ];

  constructor(private readonly mailer: Mailer, private readonly crypt: Crypt) {
    super();
    Container.set(CONSTANTS.MODEL, User);
    Container.set(CONSTANTS.MODELS_NAME, CONSTANTS.MODELS_NAME_PLAN);
  }

  public async updatePassword(
    passData: PasswordReset & { userId: number; sessionId?: number }
  ): Promise<Result<BaseResponse, BaseResponse>> {
    try {
      if (passData.newPassword === passData.verifyPassword) {
        const user = await User.findByPk(passData.userId);

        const validatePassword = this.crypt.validatePassword(passData.oldPassword, user.passwordHash, user.salt);
        if (validatePassword) {
          const newPasswordData = this.crypt.saltHashPassword(passData.newPassword);
          user.passwordHash = newPasswordData.passwordHash;
          user.salt = newPasswordData.salt;

          await user.save();
          await this.sendMail(MailThemes.PasswordResetConfirm, user);

          if (passData.deleteSessions) {
            const sessionRemoved = await this.removeUserSessionsExept(passData.userId, passData.sessionId);
            if (sessionRemoved.isErr()) {
              return ok({
                success: true,
                message:
                  'You have changed your password, but there was a problem trying to delete your other active sessions, please do it manually in the "Sessions tab".'
              });
            }
          }
          return ok({
            success: true,
            message: 'You have successfully changed your password.'
          });
        } else {
          return err({
            success: false,
            errorOrigin: ErrorOrigin.CLIENT,
            message: 'Current password you provided is not correct!'
          });
        }
      } else {
        return err({ success: false, errorOrigin: ErrorOrigin.CLIENT, message: 'New passwords do not match!' });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async getSession(id: number | string): Promise<Result<ItemApiResponse<UserSession>, BaseResponse>> {
    try {
      const data = await UserSession.findByPk(id);
      if (data) {
        return ok({ success: true, data });
      } else {
        return err({ success: false, errorOrigin: ErrorOrigin.CLIENT, message: 'No session with such id', data: null });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async getSessionList(user: User): Promise<Result<CollectionApiResponse<UserSession>, BaseResponse>> {
    try {
      const data = await user.getUserSessions();

      if (data.length) {
        return ok({ success: true, data });
      } else {
        return ok({ success: false, message: 'No sessions by this query', data: [] });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async removeSession(id: number | string | number[] | string[]): Promise<Result<BaseResponse, BaseResponse>> {
    try {
      const deleted = await UserSession.destroy({
        where: { id }
      });

      if (deleted > 0) {
        return ok({ success: true, message: `Deleted ${deleted} session(s)` });
      } else {
        return err({
          success: false,
          errorOrigin: ErrorOrigin.CLIENT,
          message: 'No sessions by this query',
          data: null
        });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async removeUserSessionsExept(
    UserId: number,
    currentSessionId: number
  ): Promise<Result<BaseResponse, BaseResponse>> {
    try {
      const deleted = await UserSession.destroy({
        where: { UserId, [Op.and]: [{ [Op.not]: [{ id: currentSessionId }] }] }
      });

      if (deleted > 0) {
        return ok({ success: true, message: `Deleted ${deleted} session(s)` });
      } else {
        return err({
          success: false,
          errorOrigin: ErrorOrigin.CLIENT,
          message: 'No sessions by this query',
          data: null
        });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async updateOrg(org: OrganizationAttributes): Promise<Result<ItemApiResponse<Organization>, BaseResponse>> {
    try {
      await Organization.update(
        {
          ...org
        },
        {
          where: { id: org.id }
        }
      );

      const data = await Organization.findByPk(org.id);

      if (data) {
        return ok({ success: true, message: 'Organization is updated successfully!', data });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async invite(user: UserAttributes, orgId: number): Promise<Result<ItemApiResponse<User>, BaseResponse>> {
    try {
      const password = this.crypt.genRandomString(12);
      const passwordData = this.crypt.saltHashPassword(password);
      user.passwordHash = passwordData.passwordHash;
      user.salt = passwordData.salt;
      user.OrganizationId = orgId;
      user.login = user.fullname.replace(' ', '_');
      const result = await this.create(user);

      if (result.isOk()) {
        const { data } = result.value;
        const token = this.crypt.genTimeLimitedToken(24 * 60);
        await data.createPasswordAttributes({
          token: token.value,
          tokenExpire: token.expireDate,
          passwordExpire: token.expireDate
        });

        const newUser = await this.findByPk(data.id);

        await this.sendMail(MailThemes.Invitation, {
          user: newUser,
          password,
          url: `${Config.WEB_URL}/auth/activate-account/${token.value}`
        });

        return ok({ success: true, message: 'Invitation have been sent successfully!', data });
      } else {
        return err(result.error);
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async inviteMultiple(
    users: UserAttributes[],
    orgId: number
  ): Promise<Result<CollectionApiResponse<User>, BaseResponse>> {
    const results = await Promise.all(users.map((user: UserAttributes) => this.invite(user, orgId)));
    const { values, errors } = reduceResults(results);
    const invitedUsers: User[] = values.map((value) => value.data);

    if (errors.length && !invitedUsers.length) {
      return err(errors[0]);
    } else if (errors.length && invitedUsers.length) {
      return ok({
        success: true,
        message: 'Success, but not all users were invited due to some problems...',
        data: invitedUsers
      });
    } else {
      return ok({ success: true, message: 'Invitations have been sent successfully!', data: invitedUsers });
    }
  }

  public async updateAvatar(params: {
    avatar: AssetCreationAttributes;
    userId: string;
  }): Promise<Result<ItemApiResponse<Asset>, BaseResponse>> {
    let message: string;

    try {
      const { avatar, userId } = params;

      const user = await User.findByPk(userId);
      const userAvatar = await user.getAvatar();

      if (userAvatar) {
        await Asset.destroy({
          where: { id: avatar.id }
        });

        const uploadsPath = path.join(__dirname, '../../uploads');
        const destination = uploadsPath + avatar.location + '/' + avatar.title;
        const thumbDestination = uploadsPath + avatar.location + '/thumbnails/' + avatar.title;
        await this.unlinkAsync(destination);
        await this.unlinkAsync(thumbDestination);

        message = 'User profile picture is updated successfully!';
      } else {
        message = 'User profile picture is added successfully!';
      }
      const newAvatar = await user.createAvatar(avatar as any);

      return ok({
        success: true,
        message,
        data: newAvatar
      });
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public async deleteAvatar(userId: string): Promise<Result<BaseResponse, BaseResponse>> {
    try {
      const user = await User.findByPk(userId);
      const userAvatar = await user.getAvatar();
      if (userAvatar) {
        await Asset.destroy({
          where: { id: userAvatar.id }
        });

        const uploadsPath = path.join(__dirname, '../../uploads');
        const destination = uploadsPath + userAvatar.location + '/' + userAvatar.title;
        const thumbDestination = uploadsPath + userAvatar.location + '/thumbnails/' + userAvatar.title;
        await this.unlinkAsync(destination);
        await this.unlinkAsync(thumbDestination);

        return ok({ success: true, message: 'Profile picture is deleted' });
      }
    } catch (error) {
      this.logger.error(error);
      return err({ success: false, message: CONSTANTS.TEXTS_API_GENERIC_ERROR });
    }
  }

  public sideEffect(_, id: number): Promise<User> {
    return this.findByPk(id);
  }

  // TODO: check if I can set types dynamically for params
  private sendMail(type: MailThemes, params?: any): Promise<void> {
    switch (type) {
      case MailThemes.PasswordResetConfirm:
        return this.mailer.sendPasswordResetConfirmation(params);
      case MailThemes.Invitation:
        return this.mailer.sendInvitation(params);
    }
  }
}
