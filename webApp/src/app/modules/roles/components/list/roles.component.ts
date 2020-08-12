import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppState } from '@/core/reducers';

import { isPrivileged } from '@/core/auth/store/auth.selectors';
import { RolesDataSource } from '../../services/role.datasource';
import { Role } from '../../models';
import { selectRolesTotalCount, selectRolesLoading } from '../../store/role.selectors';
import { PageQuery, ToastMessageService } from '@/shared';
import { deleteRole } from '../../store/role.actions';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit, OnDestroy, AfterViewInit {
  addRolePrivilege$: Observable<boolean>;
  editRolePrivilege$: Observable<boolean>;
  deleteRolePrivilege$: Observable<boolean>;
  dataSource: RolesDataSource;
  selection = new SelectionModel<Role>(true, []);
  loading$: Observable<boolean>;
  resultsLength$: Observable<number>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['select', 'title', 'users', 'privileges', 'createdAt', 'updatedAt', 'actions'];

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private toastMessageService: ToastMessageService
  ) {}

  ngOnInit() {
    this.addRolePrivilege$ = this.store.pipe(select(isPrivileged('role-add')));
    this.editRolePrivilege$ = this.store.pipe(select(isPrivileged('role-edit')));
    this.deleteRolePrivilege$ = this.store.pipe(select(isPrivileged('role-delete')));
    this.loading$ = this.store.pipe(select(selectRolesLoading));
    this.resultsLength$ = this.store.pipe(select(selectRolesTotalCount));
    this.dataSource = new RolesDataSource(this.store);

    const initialPage: PageQuery = {
      pageIndex: 0,
      pageSize: 5,
      sortIndex: 'id',
      sortDirection: 'asc'
    };

    this.dataSource.loadRoles(initialPage);
  }

  ngAfterViewInit() {
    // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadRolesPage()))
      .subscribe();
  }

  loadRolesPage() {
    const newPage: PageQuery = {
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      sortIndex: this.sort.active,
      sortDirection: this.sort.direction || 'asc'
    };

    this.dataSource.loadRoles(newPage);
  }

  onRoleSelect(id: number, edit: boolean = false): void {
    this.router.navigate([`/roles/details/${id}`], {
      queryParams: { edit }
    });
  }

  deleteRole(id: number): void {
    this.toastMessageService
      .confirm('Are you sure?', 'Do you really want to delete role? You will not be able to recover!')
      .then(result => {
        if (result.value) {
          this.store.dispatch(deleteRole({ id }));
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
