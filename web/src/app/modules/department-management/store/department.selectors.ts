import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Dictionary } from '@ngrx/entity';
import { denormalize } from 'normalizr';

import { selectAllUserEntities } from '@/core/modules/user-api/store';
import { selectAllDepartmentEntities } from '@/core/modules/department-api/store';
import { Department } from '@/core/modules/department-api/shared';
import { departmentListSchema } from '@/core/store/normalization';
import { PageQuery } from '@/shared/models';
import { generatePageKey } from '@/shared/utils/generatePageKey';
import { ListState, Page } from '@/shared/store';
import * as fromDepartment from './department.reducer';

export const selectDepartmentsState = createFeatureSelector<ListState<Department>>(
  fromDepartment.departmentsFeatureKey
);
export const selectDepartmentPagesState = createSelector(
  selectDepartmentsState,
  (departmentsState) => departmentsState?.pages
);

export const selectDepartmentPageByKey = (pageQuery: PageQuery) =>
  createSelector(selectDepartmentPagesState, (pagesState) => pagesState.entities[generatePageKey(pageQuery)]);

export const selectDepartmentsPageLoading = createSelector(
  selectDepartmentPagesState,
  (pagesState) => pagesState?.pageLoading
);

export const selectDepartmentsTotalCount = createSelector(
  selectDepartmentPagesState,
  (departmentsState) => departmentsState?.resultsNum
);

export const selectDepartmentsOfPage = (pageQuery: PageQuery) =>
  createSelector(
    selectAllDepartmentEntities,
    selectDepartmentPageByKey(pageQuery),
    selectAllUserEntities,
    (departmentEntities: Dictionary<Department>, page: Page, userEntities) => {
      return page
        ? (denormalize(page.dataIds, departmentListSchema, {
            Users: userEntities,
            Departments: departmentEntities
          }) as Department[])
        : [];
    }
  );

export const selectIsEditing = createSelector(selectDepartmentsState, (departmentsState) => departmentsState?.editing);
export const selectDepartmentFromCache = createSelector(
  selectDepartmentsState,
  (departmentsState) => departmentsState.cache.displayedItemCopy
);
