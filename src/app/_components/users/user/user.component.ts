import { environment } from 'environments/environment';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { RolesComponentDialogComponent } from '../../roles/roles.component';
import { AuthenticationService, UserService, PrivilegeService, StateService, LoaderService } from '@/_services';
import { User, Role, State } from '@/_models';
import { error } from 'util';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  showDataLoader: boolean;
  baseUrl: string;
  user: User;
  userInitial: User;
  states: State[];
  editForm: boolean;
  editUserPrivilege: boolean;
  langs: string[];

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private userService: UserService,
    private stateService: StateService,
    private privilegeService: PrivilegeService,
    private loaderService: LoaderService,
    private dialog: MatDialog
  ) {
    this.baseUrl = environment.baseUrl;
    this.editForm = false;
    this.showDataLoader = true;
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.editUserPrivilege = this.privilegeService.isPrivileged(user, 'editUser');
    });
    this.getUserData();
  }

  getUserData(): void {
    const id = +this.route.snapshot.paramMap.get('id');

    this.userService.getUser(id).subscribe(user => {
      this.user = user;
      this.userInitial = { ...this.user };

      this.stateService.getStatesList().subscribe(states => {
        this.states = states;
      });
    });
  }

  addRolesDialog(): void {
    this.showDataLoader = false;
    const dialogRef = this.dialog.open(RolesComponentDialogComponent, {
      height: '80vh',
      data: {
        title: 'Select roles',
      }
    });

    const rolesC = dialogRef.componentInstance.rolesComponent;

    dialogRef.afterOpened().subscribe(() => {
      this.loaderService.isLoaded.subscribe(isLoaded => {
        if (isLoaded) {
          for (const userRole of this.user.Roles) {
            rolesC.roles.find((role, i) => {
                if (role.id === userRole.id) {
                    rolesC.roles[i].selected = true;
                    return true; // stop searching
                }
            });
          }
          rolesC.resetSelected(false);
        }
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.user.Roles = result;
      }
    });
  }

  onClickEdit(): void {
    this.editForm = true;
  }

  onClickCancelEdit(): void {
    this.editForm = false;
    this.user = this.userInitial;
  }

  onUpdateUserSubmit(): void {
    swal({
      title: 'Are you sure?',
      text: 'Do you really want to save changes? You will not be able to recover this!',
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.updateUser();
      }
    });
  }

  updateUser(): void {
    this.user.Roles = this.user.Roles.filter(role => role.selected).map(role => {
        return<Role> {
          id: role.id
        };
    });

    this.userService.updateUser(this.user).subscribe(
      user => {
        this.user = user;
        this.userInitial = { ...this.user };
        this.editForm = false;
        swal({
          text: 'User updated!',
          type: 'success',
          timer: 6000,
          toast: true,
          showConfirmButton: false,
          position: 'bottom-end'
        });
      },
      error => {
        swal({
          text: 'Ooops, something went wrong!',
          type: 'error',
          timer: 3000
        });
      }
    );
  }
}
