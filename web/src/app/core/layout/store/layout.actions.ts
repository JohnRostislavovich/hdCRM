import { createAction, props } from '@ngrx/store';
import { LayoutState } from './layout.reducer';

export const toggleSidebar = createAction('[Layout] Toggle Sidebar', props<{ minimized: boolean }>());

export const sidebarChangeState = createAction('[Layout] Sidebar State Changed', props<{ minimized: boolean }>());

export const enableDarkTheme = createAction('[Layout] Enable Dark Theme', props<{ enabled: boolean }>());

export const darkThemeChangeState = createAction('[Layout] Dark Theme State Changed', props<{ enabled: boolean }>());

export const scaleFontUp = createAction('[Layout] Scale Font', props<{ scaled: boolean }>());

export const scaleFontUpChangeState = createAction('[Layout] Scale Font State Changed', props<{ scaled: boolean }>());

export const initLayoutSettings = createAction('[Layout] Init Layout Settings', props<{ settings?: LayoutState }>());
