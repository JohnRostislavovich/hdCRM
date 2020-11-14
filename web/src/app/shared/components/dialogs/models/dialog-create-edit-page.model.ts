import { MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';

import { DialogBaseModel } from './dialog-base.model';
import { DialogMode } from '@/shared/models/modal/dialog-mode.enum';
import { DialogCreateEditModel, DialogDataModel } from '@/shared/models';

@Component({
  template: ''
})
// tslint:disable-next-line:component-class-suffix
export abstract class DialogCreateEditPageModel<
  TDialogModel extends DialogCreateEditModel
> extends DialogBaseModel<TDialogModel> {
  isCreateMode: boolean;

  constructor(
    readonly dialogRef: MatDialogRef<ComponentType<unknown>>,
    protected data: DialogDataModel<TDialogModel>
  ) {
    super(dialogRef, data);

    this.initializeModel();
  }

  initializeModel(): void {
    this.isCreateMode = this.dialogModel.dialogMode === DialogMode.CREATE;
    if (this.isCreateMode) {
      if (!this.data.model) {
        this.model = {} as any;
      }
    }
  }
}
