import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, filter, tap } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';

import { AppState } from '@/core/store';
import { ToastMessageService } from '@/shared/services';
import { CollectionApiResponse, ItemApiResponse } from '@/shared/models';
import * as privilegeActions from './privilege.actions';
import { PrivilegeService } from '../../services';
import { Privilege } from '../../shared/models';
import { allPrivilegesLoaded } from './privilege.selectors';

@Injectable()
export class PrivilegeEffects {
  loadAllPrivilege$ = createEffect(() =>
    this.actions$.pipe(
      ofType(privilegeActions.allPrivilegesRequested),
      withLatestFrom(this.store.pipe(select(allPrivilegesLoaded))),
      tap(([_, allPrivilegesLoaded]) => {
        if (allPrivilegesLoaded) {
          this.store.dispatch(privilegeActions.allPrivilegesRequestCanceled());
        }
      }),
      filter(([_, allPrivilegesLoaded]) => !allPrivilegesLoaded),
      mergeMap(() => this.privilegeService.getList<Privilege>()),
      map((response: CollectionApiResponse<Privilege>) => privilegeActions.allPrivilegesApiLoaded({ response })),
      catchError(() => of(privilegeActions.privilegeApiError()))
    )
  );

  createPrivilege$ = createEffect(() =>
    this.actions$.pipe(
      ofType(privilegeActions.createPrivilegeRequested),
      map((payload) => payload.privilege),
      mergeMap((privilege: Privilege) =>
        this.privilegeService.create<Privilege>(privilege).pipe(
          map((response: ItemApiResponse<Privilege>) => {
            this.toastMessageService.snack(response);
            return privilegeActions.createPrivilegeSuccess({
              privilege: response.data
            });
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            this.toastMessageService.snack(errorResponse.error);
            return of(privilegeActions.privilegeApiError());
          })
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<AppState>,
    private readonly privilegeService: PrivilegeService,
    private readonly toastMessageService: ToastMessageService
  ) {}
}
