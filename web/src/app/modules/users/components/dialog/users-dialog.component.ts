import { Component, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersComponent } from '../list/users.component';
import { ACTION_LABELS } from '@/shared/constants';

export interface UsersDialogData {
  title: string;
}
@Component({
  templateUrl: 'users-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersDialogComponent {
  actionLabels = ACTION_LABELS;

  constructor(
    public dialogRef: MatDialogRef<UsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsersDialogData
  ) {}

  @ViewChild(UsersComponent, { static: true })
  usersComponent: UsersComponent;

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick(): void {
    this.dialogRef.close(this.usersComponent.selection.selected);
  }
}
