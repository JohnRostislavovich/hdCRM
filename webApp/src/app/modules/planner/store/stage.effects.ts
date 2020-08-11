import { Injectable } from '@angular/core';
import { throwError, of } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import * as stageActions from './stage.actions';
import { mergeMap, map, withLatestFrom, filter, catchError } from 'rxjs/operators';
import { StageService } from '../services';
import { AppState } from '@/core/reducers';
import { Stage } from '../models';
import { allStagesLoaded } from './stage.selectors';
import { ToastMessageService } from '@/shared/services';

@Injectable()
export class StageEffects {
  loadAllStage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(stageActions.allStagesRequestedFromDashboard, stageActions.allStagesRequestedFromDialogWindow),
      withLatestFrom(this.store.pipe(select(allStagesLoaded))),
      filter(([action, allStagesLoaded]) => !allStagesLoaded),
      mergeMap(() => this.stageService.getList()),
      map(response => stageActions.allStagesLoaded({ response })),
      catchError(err => throwError(err))
    )
  );

  createStage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(stageActions.createStage),
      map(payload => payload.stage),
      mergeMap((stage: Stage) =>
        this.stageService.create(stage).pipe(
          map(newStage => {
            this.toastMessageService.popup('Stage created!', 'success', 1500);
            return stageActions.createStageSuccess({
              stage: newStage
            });
          }),
          catchError(error => {
            this.toastMessageService.popup('Ooops, something went wrong!', 'success', 1500);
            return of(stageActions.createStageFail({ error }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private stageService: StageService,
    private toastMessageService: ToastMessageService
  ) {}
}
