import { Component, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrivilegesComponent } from '../list/privileges.component';
import { Privilege } from '@/modules/roles/models';

export interface PrivilegesDialogData {
  title: string;
}
@Component({
  templateUrl: 'privileges-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivilegesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PrivilegesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrivilegesDialogData
  ) {}

  @ViewChild(PrivilegesComponent, { static: true })
  privilegesComponent: PrivilegesComponent;

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmiteClick(privileges: Privilege[]): void {
    this.dialogRef.close(privileges);
  }
}
