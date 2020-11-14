import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DialogBaseModel } from '@/shared/components';
import { DialogDataModel, DialogType, DialogWithTwoButtonModel } from '@/shared/models';
import { DialogConfirmModel } from '@/shared/models/dialog/dialog-confirm.model';
import { DialogSizeService } from '@/shared/services';
import { DIALOG, STYLECONSTANTS } from '@/shared/constants';
import { DialogResultModel } from '@/shared/models/dialog/dialog-result.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private unsubscribe: Subject<void> = new Subject();

  constructor(private _matDialog: MatDialog, private dialogSizeService: DialogSizeService) {}

  confirm<TDialogModel extends DialogConfirmModel>(
    componentType: ComponentType<DialogBaseModel<TDialogModel>>,
    dialogModel: DialogDataModel<TDialogModel>,
    onConfirmCallback: Function
  ): void {
    this.open(componentType, dialogModel, this.dialogSizeService.getSize(DialogType.CONFIRM))
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((result: DialogResultModel<unknown>) => {
        if (result && result.success) {
          onConfirmCallback();
        }
      });
  }

  open<TDialogModel extends DialogWithTwoButtonModel>(
    componentType: ComponentType<DialogBaseModel<TDialogModel>>,
    data: DialogDataModel<TDialogModel>,
    dialogSize: MatDialogConfig = this.dialogSizeService.getSize()
  ): MatDialogRef<DialogBaseModel<TDialogModel>> {
    return this._matDialog.open(componentType, {
      data: data,
      closeOnNavigation: true,
      disableClose: true,
      height: STYLECONSTANTS.FIT_CONTENT,
      maxWidth: DIALOG.MAX_WIDTH,
      maxHeight: DIALOG.MAX_HEIGHT,
      ...dialogSize
    });
  }
}
