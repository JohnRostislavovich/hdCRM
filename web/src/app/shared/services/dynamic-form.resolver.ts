import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, filter, first } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';

import { AppState } from '@/core/reducers';
import { formRequested } from '@/core/reducers/dynamic-form/dynamic-form.actions';
import { selectFormByName } from '@/core/reducers/dynamic-form/dynamic-form.selectors';
import { DynamicForm } from '@/shared/models';
import { RoutingDataConstants } from '@/shared/constants';

@Injectable()
export class DynamicFormResolver implements Resolve<DynamicForm> {
  constructor(private store$: Store<AppState>) {}

  resolve(route: ActivatedRouteSnapshot): Observable<DynamicForm> {
    const formName = route.data[RoutingDataConstants.FORM_NAME];

    return this.store$.pipe(
      select(selectFormByName(formName)),
      tap((form) => {
        if (!form) {
          this.store$.dispatch(formRequested({ formName }));
        }
      }),
      filter((form) => !!form),
      first()
    );
  }
}
