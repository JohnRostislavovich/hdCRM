import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { defer, of } from 'rxjs';
import * as layoutActions from './layout.actions';
import { switchMap, map } from 'rxjs/operators';
import { LocalStorageService } from '@/shared';

@Injectable()
export class LayoutEffects {
  constructor(private actions$: Actions, private localStorage: LocalStorageService) {}

  toggleLeftSidebar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(layoutActions.toggleLeftSidebar),
      map(payload => payload.minimized),
      switchMap(minimized => {
        window.dispatchEvent(new Event('resize'));
        this.localStorage.setObjectKeyValue('layoutSettings', 'hideLeftSidebar', minimized);
        return of(layoutActions.leftSidebarChangeState({ minimized }));
      })
    )
  );

  toggleRightSidebar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(layoutActions.toggleRightSidebar),
      map(payload => payload.minimized),
      switchMap(minimized => {
        window.dispatchEvent(new Event('resize'));
        this.localStorage.setObjectKeyValue('layoutSettings', 'hideRightSidebar', minimized);
        return of(layoutActions.rightSidebarChangeState({ minimized }));
      })
    )
  );

  enableDarkTheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(layoutActions.enableDarkTheme),
      map(payload => payload.enabled),
      switchMap(enabled => {
        this.localStorage.setObjectKeyValue('layoutSettings', 'enableDarkTheme', enabled);
        return of(layoutActions.darkThemeChangeState({ enabled }));
      })
    )
  );

  scaleFontUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(layoutActions.scaleFontUp),
      map(payload => payload.scaled),
      switchMap(scaled => {
        this.localStorage.setObjectKeyValue('layoutSettings', 'scaleFontUp', scaled);
        return of(layoutActions.scaleFontUpChangeState({ scaled }));
      })
    )
  );

  init$ = createEffect(() =>
    defer(() => {
      const settings = this.localStorage.getObject('layoutSettings');

      if (!!settings) {
        return of(layoutActions.initLayoutSettings({ settings }));
      }
    })
  );
}
