import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { Store, select } from '@ngrx/store';

import { AppState } from '@/core/store';
import { IconsService } from '@/core/services';
import { ConfirmPasswordValidator } from '@/shared/validators';
import { NewPassword } from '@/shared/models';
import {
  ACTION_LABEL,
  THEME_PALETTE,
  BUTTON_TYPE,
  MAT_BUTTON,
  PathConstants,
  RoutingConstants,
  BS_ICON,
  INPUT_TYPE
} from '@/shared/constants';
import * as authActions from '../../store/auth.actions';
import * as authSelectors from '../../store/auth.selectors';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean> = this.store.pipe(select(authSelectors.isLoading));

  user: FormGroup;
  newPasswordForm: FormGroup;
  currentPath: string;
  hidePassword = true;
  token: string;

  actionLabels = ACTION_LABEL;
  themePalette = THEME_PALETTE;
  buttonType = BUTTON_TYPE;
  matButtonTypes = MAT_BUTTON;
  inputTypes = INPUT_TYPE;
  paths = PathConstants;
  routes = RoutingConstants;
  icons: { [key: string]: BS_ICON } = {
    key: BS_ICON.Key,
    disabled: BS_ICON.SlashCircle,
    cancel: BS_ICON.X,
    arrow: BS_ICON.ArrowRight,
    submit: BS_ICON.Check,
    eye: BS_ICON.Eye,
    eyeDisabled: BS_ICON.EyeSlash
  };

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private store: Store<AppState>,
    private readonly iconsService: IconsService
  ) {
    this.iconsService.registerIcons([...Object.values(this.icons)]);
  }

  ngOnInit(): void {
    this.currentPath = this.route.snapshot.url[0].path;

    if (this.currentPath === PathConstants.REQUEST_NEW_PASSWORD || this.currentPath === PathConstants.LOGIN) {
      this.prepareUserForm();
    } else if (
      this.currentPath === PathConstants.PASSWORD_RESET ||
      this.currentPath === PathConstants.ACTIVATE_ACCOUNT
    ) {
      this.token = this.route.snapshot.paramMap.get('token');
      if (this.currentPath === PathConstants.ACTIVATE_ACCOUNT) {
        this.prepareUserForm();
        this.activateAccount();
      } else if (this.currentPath === PathConstants.PASSWORD_RESET) {
        this.preparePasswordResetForm();
      }
    }
  }

  prepareUserForm(): void {
    this.user = this.fb.group({
      login: new FormControl(null, [Validators.required]),
      password: new FormControl(null)
    });
    if (this.currentPath === PathConstants.LOGIN) {
      this.user.get('password').setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  preparePasswordResetForm(): void {
    this.newPasswordForm = this.fb.group(
      {
        newPassword: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(64)]),
        verifyPassword: new FormControl(null, [Validators.required])
      },
      {
        validators: ConfirmPasswordValidator.matchPassword
      }
    );
  }

  activateAccount(): void {
    this.store.dispatch(authActions.activateAccount({ token: this.token }));
  }

  onLoginSubmit() {
    this.store.dispatch(authActions.logIn({ user: this.user.value }));
  }

  onResetPasswordRequest() {
    this.store.dispatch(authActions.resetPasswordRequest({ user: this.user.value }));
  }

  onResetPassword() {
    const newPassword: NewPassword = {
      token: this.token,
      ...this.newPasswordForm.value
    };
    this.store.dispatch(authActions.setNewPassword({ newPassword }));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
