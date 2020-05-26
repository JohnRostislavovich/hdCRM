import { props, createAction } from '@ngrx/store';
import { User } from '@/modules/users/models';
import { ApiResponse, NewPassword } from '@/shared';

export const registerUser = createAction('[Auth] Register User Requested', props<{ user: User }>());

export const registerSuccess = createAction('[Auth API] Register Success', props<{ user: User }>());

export const registerFailure = createAction('[Auth API] Register Failure', props<{ response: ApiResponse }>());

export const logIn = createAction('[Auth] Login', props<{ user: User }>());

export const logInSuccess = createAction('[Auth API] Login Success', props<{ accessToken: string }>());

export const logInFailure = createAction('[Auth API] Login Failure', props<{ response: ApiResponse }>());

export const setNewPassword = createAction('[Auth] Set New Password Requested', props<{ newPassword: NewPassword }>());

export const resetPasswordRequest = createAction('[Auth] Reset Password Requested', props<{ user: User }>());

export const resetPasswordSuccess = createAction(
  '[Auth API] Reset Password Success',
  props<{ response: ApiResponse }>()
);

export const resetPasswordFailure = createAction(
  '[Auth API] Reset Password Failure',
  props<{ response: ApiResponse }>()
);

export const activateAccount = createAction('[Auth] Account Activation Requested', props<{ token: string }>());

export const activateAccountSuccess = createAction(
  '[Auth API] Account Activation Success',
  props<{ response: ApiResponse }>()
);

export const activateAccountFailure = createAction(
  '[Auth API] Account Activation Failure',
  props<{ response: ApiResponse }>()
);

export const logOut = createAction('[Auth] Logout');

export const redirectToLogin = createAction('[Auth] Redirect To Login', props<{ returnUrl: string }>());

export const getStatus = createAction('[Auth] Get Status');

export const profileSaved = createAction('[My Profile] Profile Saved', props<{ user: User }>());
export const requestCurrentUser = createAction('[App] Current User Requested');
export const currentUserLoaded = createAction('[Auth API] Current User Loaded', props<{ currentUser: User }>());
export const currentUserLoadFailed = createAction(
  '[Auth API] Current User Load Failure',
  props<{ response: ApiResponse }>()
);
