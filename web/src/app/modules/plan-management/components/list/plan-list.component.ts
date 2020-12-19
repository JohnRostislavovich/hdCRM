import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Store, select } from '@ngrx/store';

import { AppState } from '@/core/store';
import { isPrivileged } from '@/core/modules/auth/store/auth.selectors';
import { deletePlanRequested } from '@/core/modules/plan-api/store/plan';
import { DialogDataModel } from '@/shared/models';
import { RoutingConstants, CONSTANTS, BS_ICONS } from '@/shared/constants';
import { ADD_PRIVILEGES, EDIT_PRIVILEGES, DELETE_PRIVILEGES, COLUMN_NAMES } from '@/shared/constants';
import { DialogConfirmModel } from '@/shared/models/dialog/dialog-confirm.model';
import { DialogConfirmComponent } from '@/shared/components/dialogs/dialog-confirm/dialog-confirm.component';
import { DialogService } from '@/shared/services';
import { DataColumn } from '@/shared/models/table';
import { selectPlanPageLoading, selectPlansTotalCount, changeIsEditingState } from '../../store';
import { PlansDataSource } from '../../dataSources';

@Component({
  templateUrl: './plan-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanListComponent {
  dataSource: PlansDataSource = new PlansDataSource(this.store$);
  loading$: Observable<boolean> = this.store$.pipe(select(selectPlanPageLoading));
  resultsLength$: Observable<number> = this.store$.pipe(select(selectPlansTotalCount));
  canAddPlan$: Observable<boolean> = this.store$.pipe(select(isPrivileged(ADD_PRIVILEGES.PLAN)));
  canEditPlan$: Observable<boolean> = this.store$.pipe(select(isPrivileged(EDIT_PRIVILEGES.PLAN)));
  canDeletePlan$: Observable<boolean> = this.store$.pipe(select(isPrivileged(DELETE_PRIVILEGES.PLAN)));

  addPlanRoute = RoutingConstants.ROUTE_PLANNER_ADD;
  listIcons: { [key: string]: BS_ICONS } = {
    add: BS_ICONS.Plus
  };

  displayedColumns: DataColumn[] = [
    DataColumn.createSequenceNumberColumn(),
    DataColumn.createColumn({ title: COLUMN_NAMES.TITLE }),
    DataColumn.createColumn({ title: COLUMN_NAMES.STAGE, hasSorting: false }),
    DataColumn.createLinkColumn({ title: COLUMN_NAMES.CREATOR, hasSorting: false }),
    DataColumn.createColumn({ title: COLUMN_NAMES.PARTICIPANTS, hasSorting: false }),
    DataColumn.createColumn({ title: COLUMN_NAMES.CREATED_AT }),
    DataColumn.createColumn({ title: COLUMN_NAMES.UPDATED_AT }),
    DataColumn.createActionsColumn()
  ];

  constructor(
    private readonly store$: Store<AppState>,
    private readonly router: Router,
    private readonly dialogService: DialogService
  ) {}

  onPlanSelect(id: number, edit: boolean = false): void {
    this.router.navigateByUrl(`${RoutingConstants.ROUTE_PLANNER_DETAILS}/${id}`);
    this.store$.dispatch(changeIsEditingState({ isEditing: edit }));
  }

  deletePlan(id: number): void {
    const dialogModel: DialogConfirmModel = new DialogConfirmModel(CONSTANTS.TEXTS_DELETE_PLAN_CONFIRM);
    const dialogDataModel: DialogDataModel<DialogConfirmModel> = { dialogModel };

    this.dialogService.confirm(DialogConfirmComponent, dialogDataModel, () =>
      this.store$.dispatch(deletePlanRequested({ id }))
    );
  }
}
