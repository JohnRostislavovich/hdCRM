import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of, defer } from 'rxjs';
import { tap, map, switchMap, catchError, concatMap, combineAll } from 'rxjs/operators';

import * as authActions from './auth.actions';

import { AuthenticationService } from '../services';
import Swal from 'sweetalert2';

import { JwtHelperService } from '@auth0/angular-jwt';
import { SocketService, SocketEvent } from '@/shared';
import { HttpErrorResponse } from '@angular/common/http';
const jwtHelper = new JwtHelperService();

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private scktService: SocketService
  ) {}

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.registerUser),
      map(payload => payload.user),
      switchMap(registerData =>
        this.authService.registerUser(registerData).pipe(
          map(user => authActions.registerSuccess(user)),
          tap(() => this.router.navigateByUrl('/auth/register-success')),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.registerFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  logIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logIn),
      map(payload => payload.user),
      switchMap(userLoginData =>
        this.authService.login(userLoginData).pipe(
          map(accessToken => authActions.logInSuccess({ accessToken })),
          tap(action => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
            this.router.navigateByUrl(returnUrl);
          }),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.logInFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  logOut$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.logOut),
        tap(() =>
          this.authService.logout().subscribe(() => {
            this.scktService.emit(SocketEvent.ISOFFLINE);
            this.router.navigateByUrl('/home');
          })
        )
      ),
    {
      dispatch: false
    }
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.resetPasswordRequest),
      map(payload => payload.user),
      switchMap(user =>
        this.authService.requestPasswordReset(user).pipe(
          map(response => authActions.resetPasswordSuccess({ response })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.resetPasswordFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  setNewPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.setNewPassword),
      map(payload => payload.newPassword),
      switchMap(newPassword =>
        this.authService.resetPassword(newPassword).pipe(
          map(response => authActions.resetPasswordSuccess({ response })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.resetPasswordFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  activateAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.activateAccount),
      map(payload => payload.token),
      concatMap(token =>
        this.authService.activateAccount(token).pipe(
          map(response => authActions.activateAccountSuccess({ response })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.activateAccountFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  redirectToLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.redirectToLogin),
        tap(action => {
          Swal.fire({
            text: 'You are not authorized to see this page, or your session has been expired!',
            icon: 'error',
            timer: 3000
          });
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: action.returnUrl }
          });
        })
      ),
    {
      dispatch: false
    }
  );

  requestCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.requestCurrentUser),
      switchMap(() =>
        this.authService.getProfile().pipe(
          map(currentUser => {
            this.scktService.emit(SocketEvent.ISONLINE, {
              id: currentUser.id,
              name: currentUser.name,
              surname: currentUser.surname,
              avatar: currentUser.avatar,
              OrganizationId: currentUser.OrganizationId
            });

            return authActions.currentUserLoaded({ currentUser });
          }),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.currentUserLoadFailed({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      // TODO: @IMalaniak refreshSession
      ofType(authActions.logInSuccess, authActions.refreshSessionSuccess),
      switchMap(() => of(authActions.requestCurrentUser()))
    )
  );

  // todo @IMalaniak redirect to login effect
  refreshSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.refreshSession),
      switchMap(() =>
        this.authService.refreshSession().pipe(
          map(accessToken => authActions.refreshSessionSuccess({ accessToken })),
          catchError((errorResponse: HttpErrorResponse) =>
            of(authActions.refreshSessionFailure({ response: errorResponse.error }))
          )
        )
      )
    )
  );

  init$ = createEffect(() => defer(() => of(authActions.refreshSession())));
}
