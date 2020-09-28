import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState, authFeatureKey } from './auth.reducer';

import { Privilege } from '@/modules/roles';
import { User } from '@/modules/users';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const isLoading = createSelector(selectAuthState, (auth) => auth.loading);

export const currentUser = createSelector(selectAuthState, (auth) => auth.currentUser);

export const getToken = createSelector(selectAuthState, (auth) => auth.accessToken);

export const getSessionId = createSelector(selectAuthState, (auth) => auth.sessionId);

export const isTokenRefreshing = createSelector(selectAuthState, (auth) => auth.isTokenRefreshing);

export const isTokenValid = createSelector(selectAuthState, (auth) => auth.isTokenValid);

export const isLoggedIn = createSelector(selectAuthState, isTokenValid, (auth, valid) => auth.loggedIn && valid);

export const isLoggedOut = createSelector(isLoggedIn, (loggedIn) => !loggedIn);

// get an array pf currentUser privileges
export const getPrivileges = createSelector<object, User, Privilege[]>(currentUser, (user) => {
  let privileges: Privilege[] = [];
  if (user && user.Role) {
    privileges = [...privileges, ...user.Role.Privileges];
  }
  return privileges;
});

// check if currentUser has privilege
export const isPrivileged = (privilegeCheck: string) =>
  createSelector<object, Privilege[], boolean>(getPrivileges, (privileges) => {
    let isPrivileged = false;
    if (privileges && privileges.length) {
      const [symbol, action] = privilegeCheck.split('-');
      const check: Privilege = privileges.find((privilege) => {
        return privilege.keyString === symbol;
      });
      isPrivileged = check && check.RolePrivilege && check.RolePrivilege[action];
    }
    return isPrivileged;
  });
