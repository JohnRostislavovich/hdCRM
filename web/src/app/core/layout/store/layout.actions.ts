import { createAction, props } from '@ngrx/store';
import { LayoutState } from './layout.reducer';

const prefix = '[Layout]';
export const toggleSidebar = createAction(`${prefix} Toggle Sidebar`, props<{ minimized: boolean }>());
export const sidebarChangeState = createAction(`${prefix} Sidebar State Changed`, props<{ minimized: boolean }>());

export const toggleUserDropdown = createAction(`${prefix} Toggle User Dropdown`);
export const closeUserDropdown = createAction(`${prefix} Close User Dropdown`);

export const enableDarkTheme = createAction(`${prefix} Enable Dark Theme`, props<{ enabled: boolean }>());
export const darkThemeChangeState = createAction(`${prefix} Dark Theme State Changed`, props<{ enabled: boolean }>());

export const scaleFontUp = createAction(`${prefix} Scale Font`, props<{ scaled: boolean }>());
export const scaleFontUpChangeState = createAction(`${prefix} Scale Font State Changed`, props<{ scaled: boolean }>());

export const initLayoutSettings = createAction(`${prefix} Init Layout Settings`, props<{ settings?: LayoutState }>());
