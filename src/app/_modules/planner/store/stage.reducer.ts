import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Stage } from '../_models';
import { PlanActions, PlanActionTypes } from './plan.actions';


export interface StagesState extends EntityState<Stage> {
  allStagesLoaded: boolean;
  error: string;
  loading: boolean;
}

export const adapter: EntityAdapter<Stage> = createEntityAdapter<Stage>();


export const initialStagesState: StagesState = adapter.getInitialState({
  allStagesLoaded: false,
  error: null,
  loading: false
});


export function stagesReducer(state = initialStagesState , action: PlanActions): StagesState {

  switch (action.type) {

    case PlanActionTypes.CreateStageSuccess:
      return adapter.addOne(action.payload.stage, state);

    case PlanActionTypes.CreateStageFail:
      return {
        ...state,
        error: action.payload
      };

    case PlanActionTypes.AllStagesRequestedFromDashboard || PlanActionTypes.AllStagesRequestedFromDialogWindow:
      return {
        ...state,
        loading: true
      };

    case PlanActionTypes.AllStagesLoaded:
      return adapter.addAll(action.payload.list, {...state, allStagesLoaded: true, loading: false});

    case PlanActionTypes.StageSaved:
      return adapter.updateOne(action.payload.stage, state);

    default: {
      return state;
    }

  }
}

export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = adapter.getSelectors();
