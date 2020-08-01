import { createAct, ActionsUnion } from '@model/store/redux.model';
import { State as TestState } from '@public-reducer/test.types';

export type State = TestState;

const initialState: State = {
  count: 0,
  lastPing: null,
};

export const Act = {
  testPing: () => createAct('[test] ping', {}),
  testIncrement: () => createAct('[test] increment', {}),
  testDecrement: () => createAct('[test] decrement', {}),
  setTestCount: (count: number) => createAct('[test] set count', { count }),
};

export type Action = ActionsUnion<typeof Act>;

export const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case '[test] set count': return { ...state, count: action.pay.count };
    case '[test] decrement': return { ...state, count: state.count - 1 };
    case '[test] increment': return { ...state, count: state.count + 1 };
    case '[test] ping': return { ...state, lastPing: `${Date()}` };
    default: return state;
  }
};
