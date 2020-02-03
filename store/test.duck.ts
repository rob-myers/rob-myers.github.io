import { createAct } from './redux-util';

interface State {
  count: number;
  lastPing: null | string;
}

const initialState: State = {
  count: 0,
  lastPing: null,
};

const TEST_PING = 'TEST_PING';
export const testPing = createAct(TEST_PING);

const TEST_INCREMENT = 'TEST_INCREMENT';
export const testIncrement = createAct(TEST_INCREMENT);

const TEST_DECREMENT = 'TEST_DECREMENT';
export const testDecrement = createAct(TEST_DECREMENT);

type Action = (
  | typeof testPing
  | typeof testIncrement
  | typeof testDecrement
)

export default (state = initialState, action: Action): State => {
  switch (action.type) {
    case TEST_DECREMENT: return { ...state, count: state.count - 1 };
    case TEST_INCREMENT: return { ...state, count: state.count + 1 };
    case TEST_PING: return { ...state, lastPing: `${new Date()}` };
    default: return state;
  }
};
