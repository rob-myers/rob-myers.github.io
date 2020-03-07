import { createAct, ActionsUnion } from '../model/redux.model';

export interface State {
  count: number;
  lastPing: null | string;
}

const initialState: State = {
  count: 0,
  lastPing: null,
};

export const Act = {
  testPing: () => createAct('TEST_PING', {}),
  testIncrement: () => createAct('TEST_INCREMENT', {}),
  testDecrement: () => createAct('TEST_DECREMENT', {}),
  setTestCount: (count: number) => createAct('SET_TEST_COUNT', { count }),
};

export type Action = ActionsUnion<typeof Act>;

export const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case 'SET_TEST_COUNT': return { ...state, count: action.pay.count };
    case 'TEST_DECREMENT': return { ...state, count: state.count - 1 };
    case 'TEST_INCREMENT': return { ...state, count: state.count + 1 };
    case 'TEST_PING': return { ...state, lastPing: `${Date()}` };
    default: return state;
  }
};
