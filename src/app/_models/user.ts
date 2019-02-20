import { Role } from './role';
import { State } from './state';
import { Asset } from './asset';
import { UserLoginHistory } from './userLoginHistory'

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
  avatar: Asset;
  selected: boolean;
  token?: string;
  lastSessionData: UserLoginHistory;
}
