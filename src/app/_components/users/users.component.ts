import { environment } from 'environments/environment';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  Sort,
  MatTabChangeEvent,
  MatCheckboxChange
 } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService, UserService, PrivilegeService, StateService } from '@/_services';
import { User, State } from '@/_models';
import swal from 'sweetalert2';
import { error } from 'util';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  baseUrl: string;
  users: User[];
  selectedUsers: User[] = [];
  notSelectedUsers: User[];
  states: State[];
  sortedData: User[];
  editUserPrivilege: boolean;
  addUserPrivilege: boolean;
  selectedTab: string;
  selectedState: string;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private userService: UserService,
    private stateService: StateService,
    private privilegeService: PrivilegeService,
  ) {
    this.baseUrl = environment.baseUrl;
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.editUserPrivilege = this.privilegeService.isPrivileged(user, 'editUser');
      this.addUserPrivilege = this.privilegeService.isPrivileged(user, 'addUser');
    });
    this.userService.getList().subscribe(users => {
      this.users = users.map(user => {
        user.selected = false;
        return user;
      });
      this.stateService.getStatesList().subscribe(states => {
        this.states = states;
        for (const i in this.states) {
          if (this.states[i].keyString === 'active') {
            this.selectedTab = i;
            this.selectedState = 'active';
            break;
          }
        }
      });
    });
  }

  sortByState(stateId: number): void {
    this.sortedData = this.users.filter(user => user.StateId === stateId);
    this.resetSelected();
  }

  selectAll(event: MatCheckboxChange): void {
    for (const user of this.sortedData) {
      user.selected = event.checked;
    }
    this.resetSelected(false);
  }

  onTabClick(event: MatTabChangeEvent): void {
    this.sortByState(this.states[event.index].id);
    this.selectedState = this.states[event.index].keyString;
  }

  sortData(sort: Sort) {
    const data = this.users.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'login': return compare(a.login, b.login, isAsc);
        case 'email': return compare(a.email, b.email, isAsc);
        case 'name': return compare(a.name, b.name, isAsc);
        case 'surname': return compare(a.surname, b.surname, isAsc);
        case 'phone': return compare(a.phone, b.phone, isAsc);
        case 'state': return compare(a.State.keyString, b.State.keyString, isAsc);
        case 'createdAt': return compare(a.createdAt, b.createdAt, isAsc);
        case 'updatedAt': return compare(a.updatedAt, b.updatedAt, isAsc);
        case 'defaultLang': return compare(a.defaultLang, b.defaultLang, isAsc);
        default: return 0;
      }
    });
  }

  changeUserState(user, state): void {
    const userState = new User();
    userState.id = user.id;
    userState.StateId = state;
    this.userService.updateUserState(userState).subscribe(
      userData => {
        user.State = userData.State;
        swal({
          text: `User state was changed to: ${state.keyString}`,
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
          timer: 1500
        });
      }
    );
  }

  onUserSelect(id): void {
    this.router.navigate([`/users/details/${id}`]);
  }

  onUserCheck(user: User): void {
    const i = this.selectedUsers.indexOf(user);
    if (i >= 0) {
      this.selectedUsers.splice(i, 1);
      this.notSelectedUsers.push(user);
    } else {
      if (user.selected) {
        this.selectedUsers.push(user);
        this.notSelectedUsers.splice(this.notSelectedUsers.indexOf(user), 1);
      }
    }
  }

  changeStateOfSelected(stateTitle: string = 'active'): void {
    let state;
    for (state of this.states) {
      if (state.keyString === stateTitle) {
        break;
      }
    }

    this.userService.changeStateOfSelected(this.selectedUsers, state).subscribe(
      response => {
        for (const user of this.selectedUsers) {
          const i = this.users.indexOf(user);
          this.users[i].selected = user.selected = false;
          this.users[i].StateId = user.StateId = state.id;
          this.users[i].State = user.State = state;
        }
        this.resetSelected();
        swal({
          text: `User state was changed to: ${state.keyString}`,
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
          timer: 1500
        });
      }
    );
  }

  resetSelected(reset: boolean = true): void {
    const self = this;
    if (reset) {
      this.selectedUsers = [];
      this.notSelectedUsers = [...this.sortedData];
    } else {
      self.resetSelected();
      for (const user of this.sortedData) {
        if (user.selected) {
          this.selectedUsers.push(user);
          this.notSelectedUsers.splice(this.notSelectedUsers.indexOf(user), 1);
        }
      }
    }
  }

}

export interface UsersDialogData {
  title: string;
}
@Component({
  templateUrl: 'users.component-dialog.html',
})
export class UsersComponentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<UsersComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsersDialogData
  ) {}

  @ViewChild(UsersComponent)
    usersComponent: UsersComponent;

  onNoClick(): void {
    this.dialogRef.close();
  }

}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
