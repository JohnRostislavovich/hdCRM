import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { CdkTable } from '@angular/cdk/table';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { merge, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { IconsService } from '@/core/services';
import { AppState } from '@/core/store';
import { getItemsPerPageState } from '@/core/store/preferences';
import {
  removeTableConfig,
  setTableConfig,
  tableColumnsConfig,
  tableColumnsToDisplay
} from '@/core/modules/layout/store';
import { DataColumn } from '@/shared/models/table/data-column.model';
import { DataRow } from '@/shared/models/table/data-row';
import {
  BS_ICONS,
  BUTTON_TYPE,
  COLUMN_KEYS,
  CONSTANTS,
  IItemsPerPage,
  MAT_BUTTON,
  pageSizeOptions,
  SORT_DIRECTION,
  STYLECONSTANTS,
  THEME_PALETTE
} from '@/shared/constants';
import { HorizontalAlign } from '@/shared/models/table/horizontalAlign.enum';
import {
  CellType,
  RowAction,
  RowActionData,
  RowActionType,
  TableColumnConfig,
  TableConfig
} from '@/shared/models/table';
import { CommonDataSource } from '@/shared/services';
import { PageQuery } from '@/shared/models';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges, AfterViewInit, OnDestroy {
  itemsPerPageState$: Observable<IItemsPerPage> = this.store$.pipe(select(getItemsPerPageState));
  columnsToDisplay$: Observable<string[]>;

  @Input() id: string;
  @Input() dataSource: CommonDataSource<DataRow>;
  @Input() totalItems: number;
  @Input() columns: DataColumn[];
  @Input() canSort = true;
  @Input() hasSettings = true;
  @Input() noContentMessage = CONSTANTS.NO_CONTENT_INFO;
  @Input() hasOutlineBorder = true; // TODO: add logic to set it based on user preference
  @Input() rowActions: RowAction<RowActionType, any>[];

  @Output() readonly rowAction: EventEmitter<RowActionData<RowActionType, any>> = new EventEmitter<
    RowActionData<RowActionType, any>
  >();

  @ViewChild('table') table: MatTable<CdkTable<DataRow>>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  pageSizeOptions: number[] = pageSizeOptions;
  cellType = CellType;
  buttonType = BUTTON_TYPE;
  matButtonType = MAT_BUTTON;
  themePalette = THEME_PALETTE;
  columnActions = COLUMN_KEYS.ACTIONS;
  columnsInitialState: TableColumnConfig[];

  icons: { [key: string]: BS_ICONS } = {
    checksGrid: BS_ICONS.UiChecksGrid,
    threeDots: BS_ICONS.ThreeDotsVertical,
    checkCircle: BS_ICONS.CheckCircle,
    xCircle: BS_ICONS.XCircle,
    'info-square': BS_ICONS.InfoSquare,
    pencil: BS_ICONS.Pencil,
    trash: BS_ICONS.Trash,
    details: BS_ICONS.ArrowRightShort,
    list: BS_ICONS.List,
    gear: BS_ICONS.Gear,
    arrowClock: BS_ICONS.ArrowClockwise,
    gripVertival: BS_ICONS.GripVertical,
    columnDrag: BS_ICONS.GripHorizontal
  };

  private unsubscribe: Subject<void> = new Subject();

  constructor(private readonly store$: Store<AppState>, private readonly iconsService: IconsService) {
    this.iconsService.registerIcons([...Object.values(this.icons)]);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columns && this.columns) {
      this.setColumns();
    }
  }

  ngAfterViewInit(): void {
    const sort$ = this.sort.sortChange.pipe(tap(() => (this.paginator.pageIndex = 0)));
    merge(sort$, this.paginator.page)
      .pipe(tap(() => this.loadDataPage()))
      .subscribe();

    this.loadDataPage();
  }

  trackById(_index: number, item: any): void {
    return item.id;
  }

  getSequenceNumber(index: number): number {
    return this.paginator.pageIndex * this.paginator.pageSize + index + 1;
  }

  getColumnClasses(align: HorizontalAlign, customClass?: string): string {
    let resultClasses: string;

    switch (align) {
      case HorizontalAlign.Left:
        resultClasses = STYLECONSTANTS.TEXT_LEFT;
        break;
      case HorizontalAlign.Center:
        resultClasses = STYLECONSTANTS.TEXT_CENTER;
        break;
      case HorizontalAlign.Right:
        resultClasses = STYLECONSTANTS.TEXT_RIGHT;
        break;
      default:
        resultClasses = STYLECONSTANTS.TEXT_LEFT;
        break;
    }

    if (customClass && customClass !== '') {
      resultClasses += ` ${customClass}`;
    }

    return resultClasses.trim();
  }

  getActionsStickyBorders(title: string): string {
    if (title === COLUMN_KEYS.ACTIONS && this.hasOutlineBorder) {
      return STYLECONSTANTS.STICKY_WITH_BORDER;
    }
    return '';
  }

  resetTableConfig(): void {
    this.columns = this.columns
      .sort(
        (a: DataColumn, b: DataColumn) =>
          this.columnsInitialState.findIndex((col: TableColumnConfig) => col.title === a.key) -
          this.columnsInitialState.findIndex((col: TableColumnConfig) => col.title === b.key)
      )
      .map((col: DataColumn, i: number) => ({ ...col, isVisible: this.columnsInitialState[i].isVisible }));
    this.store$.dispatch(removeTableConfig({ key: this.id }));
  }

  updateTableConfig(): void {
    const tableConfig: TableConfig = {
      key: this.id,
      columns: this.columns.map((col) => ({ title: col.key, isVisible: col.isVisible }))
    };
    this.store$.dispatch(setTableConfig({ tableConfig }));
  }

  rowDedicatedAction(item: any, data: RowActionData<RowActionType, any>): void {
    this.rowAction.emit({
      ...data,
      item
    });
  }

  rowSelect(id: number): void {
    this.rowAction.emit({
      item: { id },
      actionType: RowActionType.DETAILS
    });
  }

  dropColumns(event: CdkDragDrop<DataColumn[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.updateTableConfig();
  }

  dropColumnsPredicate(index: number, _: CdkDrag<DataColumn>, dropList: CdkDropList<DataColumn[]>) {
    return dropList.data[index].draggable;
  }

  private setColumns(): void {
    this.columnsInitialState = this.columns.map((col) => ({ title: col.key, isVisible: col.isVisible }));
    this.columnsToDisplay$ = this.store$.pipe(
      select(tableColumnsToDisplay(this.id)),
      map((columns) => (!columns ? this.columnsInitialState.filter((c) => c.isVisible).map((c) => c.title) : columns))
    );
    this.store$.pipe(select(tableColumnsConfig(this.id)), takeUntil(this.unsubscribe)).subscribe((columnsConfig) => {
      if (columnsConfig) {
        this.columns = this.columns
          .sort(
            (a: DataColumn, b: DataColumn) =>
              columnsConfig.findIndex((col: TableColumnConfig) => col.title === a.key) -
              columnsConfig.findIndex((col: TableColumnConfig) => col.title === b.key)
          )
          .map((col: DataColumn, i: number) => ({ ...col, isVisible: columnsConfig[i].isVisible }));
      }
    });
  }

  private loadDataPage(): void {
    const newPage: PageQuery = {
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      sortIndex: this.sort.active || COLUMN_KEYS.ID,
      sortDirection: this.sort.direction || SORT_DIRECTION.ASC
    };

    this.dataSource.loadData(newPage);
  }
}
