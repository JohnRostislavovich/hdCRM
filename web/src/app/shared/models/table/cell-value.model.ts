import { User } from '@/core/modules/user-api/shared';
import { ACTION_LABELS, BS_ICONS, STYLECONSTANTS, THEME_PALETTE } from '@/shared/constants';
import { CellActionType } from './cellActionType.enum';
import { CellControlType } from './cellControlType.enum';
import { CellValueType } from './cellValueType.enum';
import { CellAction } from './cell-action';
import { Navigation } from './navigation';

export class CellValue {
  cellAction: CellActionType;

  constructor(
    readonly value: any,
    readonly controlType: CellControlType,
    readonly customClass?: string,
    readonly navigation?: Navigation,
    readonly valueType: CellValueType = CellValueType.Value,
    readonly actions: CellAction[] = [],
    readonly disabled = false
  ) {}

  static createSequenceCell(): CellValue {
    return new CellValue(undefined, CellControlType.SequenceNumber, STYLECONSTANTS.SEQUENCE);
  }

  static createStringCell(value: string | number, customClass?: string): CellValue {
    return value ? new CellValue(value, CellControlType.String, customClass) : this.createEmptyCell();
  }

  static createLinkCell(value: string, navigation: Navigation): CellValue {
    return value
      ? new CellValue(value, CellControlType.Navigation, undefined, navigation)
      : this.createEmptyCell(STYLECONSTANTS.PL_HEADER_LINK);
  }

  static createBooleanIconCell(value: boolean, disabledColor = false): CellValue {
    return new CellValue(
      value,
      CellControlType.Icon,
      !disabledColor ? (value ? THEME_PALETTE.ACCENT : THEME_PALETTE.WARN) : ''
    );
  }

  static createCheckboxCell(action: CellActionType, value = false): CellValue {
    let cell: CellValue = new CellValue(value, CellControlType.Checkbox);
    return (cell = { ...cell, cellAction: action });
  }

  static createAvatarCell(value: User): CellValue {
    return new CellValue(value, CellControlType.Avatar);
  }

  static createDateCell(value: Date): CellValue {
    return new CellValue(value, CellControlType.Date);
  }

  static createEmptyCell(customClass = ''): CellValue {
    return new CellValue('-', CellControlType.String, customClass);
  }

  static createActionsCell(additionalActions?: CellAction[]): CellValue {
    // TODO: remove and add saperate logic in ng-content
    let actions: CellAction[] = [];

    if (additionalActions?.length) {
      actions = [...actions, ...additionalActions];
    }

    // if (privilege) {
    actions = [...actions, { type: CellActionType.Edit, icon: BS_ICONS.Pencil, label: ACTION_LABELS.EDIT }];
    // }

    // if (privilege) {
    actions = [...actions, { type: CellActionType.Delete, icon: BS_ICONS.Trash, label: ACTION_LABELS.DELETE }];
    // }

    return new CellValue(undefined, CellControlType.Action, undefined, undefined, CellValueType.Actions, actions);
  }
}
