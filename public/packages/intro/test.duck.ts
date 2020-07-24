import { testNever } from '@package/shared/util';
import { createSync, createThunk, ActionsUnion } from '@package/shared/redux.model';

export interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

export const Act = {
  increment: () => createSync('[test] increment', {}),
  reset: () => createSync('[test] reset', {}),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  delayedIncrement: createThunk(
    '[test] delayed increment',
    ({ dispatch }, { delayMs }: { delayMs: number }) =>
      window.setTimeout(() => dispatch({ type: '[test] increment', payload: {} }), delayMs),
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

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
