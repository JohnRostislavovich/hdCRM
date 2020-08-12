import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import * as userActions from './user.actions';
import { mergeMap, map, catchError, tap, switchMap, retryWhen, delay } from 'rxjs/operators';
import { UserService } from '../services';
import { AppState } from '@/core/reducers';
import { UserServerResponse, User } from '../models';
import { Update } from '@ngrx/entity';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastMessageService } from '@/shared/services';

@Injectable()
export class UserEffects {
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.userRequested),
      map(payload => payload.id),
      mergeMap(id => this.userService.getUser(id)),
      map(user => userActions.userLoaded({ user }))
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.listPageRequested),
      map(payload => payload.page),
      mergeMap(page =>
        this.userService.getList(page.pageIndex, page.pageSize, page.sortIndex, page.sortDirection).pipe(
          map((response: UserServerResponse) => userActions.listPageLoaded({ response })),
          catchError(err => of(userActions.listPageCancelled()))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.updateUserRequested),
      map(payload => payload.user),
      mergeMap(toUpdate =>
        this.userService.updateUser(toUpdate).pipe(
          catchError(err => {
            userActions.updateUserCancelled();
            return of(this.toastMessageService.popup('Ooops, something went wrong!', 'error'));
          })
        )
      ),
      map((data: User) => {
        const user: Update<User> = {
          id: data.id,
          changes: data
        };
        this.toastMessageService.toast('User updated!');
        return userActions.updateUserSuccess({ user });
      })
    )
  );

  listOnlineUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.OnlineUserListRequested),
      tap(() => {
        this.userService.listOnline();
      }),
      mergeMap(() => {
        return this.userService.onlineUsersListed$.pipe(map(list => userActions.OnlineUserListLoaded({ list })));
      })
    )
  );

  userOnline$ = createEffect(() => this.userService.userOnline$.pipe(map(user => userActions.userOnline({ user }))));

  userOffline$ = createEffect(() => this.userService.userOffline$.pipe(map(user => userActions.userOffline({ user }))));

  deleteUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(userActions.deleteUser),
        map(payload => payload.id),
        mergeMap(id => this.userService.delete(id)),
        map(() => of(this.toastMessageService.toast('User deleted!')))
      ),
    {
      dispatch: false
    }
  );

  inviteUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.inviteUsers),
      map(payload => payload.users),
      mergeMap((users: User[]) =>
        this.userService.inviteUsers(users).pipe(
          map(invitedUsers => {
            return userActions.usersInvited({ invitedUsers });
          })
        )
      )
    )
  );

  changeOldPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userActions.changeOldPassword),
      map(payload => payload.newPassword),
      switchMap(newPassword =>
        this.userService.changeOldPassword(newPassword).pipe(
          map(response => userActions.changePasswordSuccess({ response })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(userActions.changePasswordFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private userService: UserService,
    private toastMessageService: ToastMessageService
  ) {}
}
