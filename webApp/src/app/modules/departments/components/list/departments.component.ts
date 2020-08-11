import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DepartmentsDataSource } from '../../services';
import { Department } from '../../models';
import { PageQuery, ToastMessageService } from '@/shared';
import { AppState } from '@/core/reducers';
import { selectDepartmentsTotalCount, selectDepartmentsLoading } from '../../store/department.selectors';
import { isPrivileged } from '@/core/auth/store/auth.selectors';
import { tap } from 'rxjs/operators';
import { deleteDepartment } from '../../store/department.actions';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentsComponent implements OnInit, AfterViewInit {
  addDepPrivilege$: Observable<boolean>;
  editDepPrivilege$: Observable<boolean>;
  deleteDepPrivilege$: Observable<boolean>;
  departments$: Observable<Department[]>;
  dataSource: DepartmentsDataSource;
  loading$: Observable<boolean>;
  resultsLength$: Observable<number>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['title', 'manager', 'workers', 'createdAt', 'updatedAt', 'actions'];

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private toastMessageService: ToastMessageService
  ) {}

  ngOnInit() {
    this.addDepPrivilege$ = this.store.pipe(select(isPrivileged('department-add')));
    this.editDepPrivilege$ = this.store.pipe(select(isPrivileged('department-edit')));
    this.deleteDepPrivilege$ = this.store.pipe(select(isPrivileged('department-delete')));
    this.loading$ = this.store.pipe(select(selectDepartmentsLoading));
    this.resultsLength$ = this.store.pipe(select(selectDepartmentsTotalCount));
    this.dataSource = new DepartmentsDataSource(this.store);

    const initialPage: PageQuery = {
      pageIndex: 0,
      pageSize: 5,
      sortIndex: 'id',
      sortDirection: 'asc'
    };

    this.dataSource.loadDepartments(initialPage);
  }

  ngAfterViewInit() {
    this.paginator.page.pipe(tap(() => this.loadDepartmentsPage())).subscribe();

    // TODO: check for other solution
    this.sort.sortChange.pipe(tap(() => this.loadDepartmentsPage())).subscribe();
  }

  loadDepartmentsPage() {
    const newPage: PageQuery = {
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      sortIndex: this.sort.active,
      sortDirection: this.sort.direction || 'asc'
    };

    this.dataSource.loadDepartments(newPage);
  }

  onDepSelect(id: number, edit: boolean = false): void {
    this.router.navigate([`/departments/details/${id}`], {
      queryParams: { edit }
    });
  }

  deleteDepartment(id: number): void {
    this.toastMessageService
      .confirm('Are you sure?', 'Do you really want to delete department? You will not be able to recover!')
      .then(result => {
        if (result.value) {
          this.store.dispatch(deleteDepartment({ id }));
        }
      });
  }
}
