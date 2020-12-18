import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState, authFeatureKey } from './auth.reducer';

import { User, UserSession } from '@/core/modules/user-api/shared';
import { Privilege } from '@/modules/roles';

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
  return user?.Role?.Privileges;
});

// check if currentUser has privilege
export const isPrivileged = (privilegeCheck: string) =>
  createSelector<object, Privilege[], boolean>(getPrivileges, (privileges) => {
    if (privileges?.length) {
      const [symbol, action] = privilegeCheck.split('-');
      const check: Privilege = privileges.find((privilege) => {
        return privilege.keyString === symbol;
      });
      return check && check.RolePrivilege && check.RolePrivilege[action];
    }
  });

export const lastSuccesfulSession = createSelector<object, User, UserSession>(currentUser, (user) => {
  const filteredSessions: UserSession[] = user?.UserSessions?.filter((session) => session.isSuccess);
  if (filteredSessions?.length) {
    return filteredSessions.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b));
  }
});

export const lastFailedSession = createSelector<object, User, UserSession>(currentUser, (user) => {
  const filteredSessions: UserSession[] = user?.UserSessions?.filter((session) => !session.isSuccess);
  if (filteredSessions?.length) {
    return filteredSessions.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b));
  }
});
