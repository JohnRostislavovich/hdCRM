import { Role } from '@/_modules/roles';
import { ApiResponse } from '@/core/_models';
import { Asset } from '@/_modules/attachments';
import { UserLoginHistory } from './userLoginHistory';
import { PasswordAttributes } from './passwordAttributes';
import { Department } from '@/_modules/departments';
import { State } from './state';

export class User {
  id: number;
  name: string;
  surname: string;
  login: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  Roles: Role[];
  selectedRoleIds: number[];
  defaultLang: string;
  StateId: number;
  State: State;
  Department: Department;
  DepartmentId: number;
  avatarId: number;
  avatar: Asset;
  selected: boolean;
  token?: string;
  lastSessionData: UserLoginHistory;
  PasswordAttributes: PasswordAttributes;

  constructor(input?: any) {
    if (input) {
      Object.assign(this, input);
      if (input.avatar) {
        this.avatar = new Asset(input.avatar);
      }
    }
  }

  get fullname(): string {
    return this.name + ' ' + this.surname;
  }

}

export class UserServerResponse extends ApiResponse {
  list: User[];
  user: User;
  pages: number;

  constructor(input?: any) {
    super();
    if (input) {
      Object.assign(this, input);
      if (input.list && input.list.length > 0) {
        this.list = input.list.map(user => {
          return new User(user);
        });
      }
    }
  }
}
