import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState, authFeatureKey } from './auth.reducer';

import { JwtHelperService } from '@auth0/angular-jwt';
import { Privilege } from '@/modules/roles';
const jwtHelper = new JwtHelperService();

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const getApiResponse = createSelector(selectAuthState, auth => auth.apiResp);

export const isLoading = createSelector(selectAuthState, auth => auth.loading);

export const currentUser = createSelector(selectAuthState, auth => auth.currentUser);

export const getToken = createSelector(selectAuthState, auth => auth.accessToken);

export const isValidToken = createSelector(getToken, token => (token ? !jwtHelper.isTokenExpired(token) : false));

export const isloggedIn = createSelector(selectAuthState, isValidToken, (auth, valid) => auth.loggedIn && valid);

export const isLoggedOut = createSelector(isloggedIn, loggedIn => !loggedIn);

// get an array pf currentUser privileges
export const getPrivileges = createSelector(currentUser, user => {
  if (user && user.Roles && user.Roles.length > 0) {
    let privileges = [];
    for (const role of user.Roles) {
      privileges.push(
        role.Privileges.map(privilege => {
          return {
            keyString: privilege.keyString,
            RolePrivilege: privilege.RolePrivilege
          };
        })
      );
    }
    privileges = [].concat(...privileges);
    privileges = privileges.filter((v, i, a) => a.indexOf(v) === i);
    return privileges;
  }
});

// check if currentUser has privilege
export const isPrivileged = (privilegeCheck: string) =>
  createSelector(getPrivileges, privileges => {
    if (privileges && privileges.length > 0) {
      const [symbol, action] = privilegeCheck.split('-');
      const check: Privilege = privileges.find(privilege => {
        return privilege.keyString === symbol;
      });
      return check && check.RolePrivilege && check.RolePrivilege[action];
    }
  });
