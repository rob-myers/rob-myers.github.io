import { testNever } from '@model/generic.model';
import { createAct, ActionsUnion } from '@model/store/redux.model';

/**
 * This state lives inside the syntax worker.
 */
export interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

export const Act = {
  increment: () => createAct('[test] increment', {}),
  reset: () => createAct('[test] reset', {}),
};

export type Action = ActionsUnion<typeof Act>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[test] increment': return { ...state,
      count: state.count + 1,
    };
    case '[test] reset': return { ...state,
      count: 0,
    };
    default: return state || testNever(act);
  }
};
