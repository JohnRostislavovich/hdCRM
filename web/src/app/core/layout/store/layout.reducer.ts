import * as LayoutActions from './layout.actions';
import { createReducer, on, Action } from '@ngrx/store';

export interface LayoutState {
  hideSidebar: boolean;
  enableDarkTheme: boolean;
  scaleFontUp: boolean;
}

const initialState: LayoutState = {
  hideSidebar: false,
  enableDarkTheme: false,
  scaleFontUp: false
};

const layoutReducer = createReducer(
  initialState,
  on(LayoutActions.sidebarChangeState, (state, { minimized }) => ({ ...state, hideSidebar: minimized })),
  on(LayoutActions.darkThemeChangeState, (state, { enabled }) => ({ ...state, enableDarkTheme: enabled })),
  on(LayoutActions.scaleFontUpChangeState, (state, { scaled }) => ({ ...state, scaleFontUp: scaled })),
  on(LayoutActions.initLayoutSettings, (state, { settings }) => ({ ...state, ...settings }))
);

export function reducer(state: LayoutState | undefined, action: Action) {
  return layoutReducer(state, action);
}

export const layoutFeatureKey = 'layout';
