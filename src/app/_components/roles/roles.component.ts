import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Role, Privilege } from '@/_models';
import { RoleService, TranslationsService } from '@/_services';
import { MatCheckboxChange } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[];
  selectedRoles: Role[];
  notSelectedRoles: Role[];
  translations: object;

  constructor(
    private translationsService: TranslationsService,
    private roleService: RoleService
  ) {
  }

  ngOnInit() {
    this.translationsService.getTranslations([
      'ROLES.PopUps.roleUsers',
      'ROLES.PopUps.addRole.title',
      'ROLES.PopUps.addRole.placeholder'
    ]).subscribe((translations: string[]) => {
      this.translations = translations;
    });

    this.getRolesData();
  }

  getRolesData(): void {
    this.roleService.getFullList().subscribe(roles => {
      this.roles = roles.map(role => {
        role.selected = false;
        return role;
      });
      this.resetSelected();
    });
  }

  selectAll(event: MatCheckboxChange): void {
    for (const role of this.roles) {
      role.selected = event.checked;
    }
    this.resetSelected(false);
  }

  onRoleCheck(role: Role): void {
    const i = this.selectedRoles.indexOf(role);
    if (i >= 0) {
      this.selectedRoles.splice(i, 1);
      this.notSelectedRoles.push(role);
    } else {
      if (role.selected) {
        this.selectedRoles.push(role);
        this.notSelectedRoles.splice(this.notSelectedRoles.indexOf(role), 1);
      }
    }
  }

  resetSelected(reset: boolean = true): void {
    const self = this;
    if (reset) {
      this.selectedRoles = [];
      this.notSelectedRoles = [...this.roles];
    } else {
      self.resetSelected();
      for (const role of this.roles) {
        if (role.selected) {
          this.selectedRoles.push(role);
          this.notSelectedRoles.splice(this.notSelectedRoles.indexOf(role), 1);
        }
      }
    }
  }
}

export interface RolesDialogData {
  title: string;
}
@Component({
  templateUrl: 'roles.component-dialog.html',
})
export class RolesComponentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RolesComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RolesDialogData
  ) {}

  @ViewChild(RolesComponent)
    rolesComponent: RolesComponent;

  onNoClick(): void {
    this.dialogRef.close();
  }

}
