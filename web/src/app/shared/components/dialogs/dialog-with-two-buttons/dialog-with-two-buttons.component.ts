import { Component, HostListener, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';

import { DialogDataModel, DialogWithTwoButtonModel } from '@/shared/models';
import { DialogBaseModel } from '../models/dialog-base.model';
import { THEME_PALETTE } from '@/shared/constants';

@Component({
  selector: 'component-dialog',
  templateUrl: './dialog-with-two-buttons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }
    `
  ]
})
export class DialogWithTwoButtonsComponent<T extends DialogWithTwoButtonModel> extends DialogBaseModel<T> {
  cancelBtnColor = THEME_PALETTE.BASIC;

  constructor(
    readonly dialogRef: MatDialogRef<ComponentType<unknown>>,
    @Inject(MAT_DIALOG_DATA) protected data: DialogDataModel<T>,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    super(dialogRef, data);
  }

  @HostListener('window:keyup.enter') onKeyUpEnter(): void {
    const successButton = this.document.getElementById('successButton');
    if (successButton && !this.formValid) {
      this.dialogClose.emit(true);
    }
  }

  onOkButtonClick(): void {
    this.dialogClose.emit(true);
  }

  onCancelButtonClick(): void {
    this.dialogClose.emit(false);
  }
}
