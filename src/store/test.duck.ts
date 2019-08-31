import { generateSync, generateThunk } from "@src/model/redux.model";
import { testNever } from "@src/util";
import { Merge } from "@src/model/generic.model";

export interface State {
  lastPing: null | string;
  count: number;
}
/**
 * Persisted state must be serializable.
 */
export type SerializedState = Merge<State, { lastPing: null | string }>;

const initialState: State = {
  lastPing: null,
  count: 0
};

//#region sync actions
export const testPing = generateSync("TEST_PING", ({  }: {}, state: State) => ({
  ...state,
  lastPing: `${new Date()}`
}));
// export type TestPing = typeof testPing["act"];

export const testIncrement = generateSync("TEST_INCREMENT", ({  }: {}, state: State) => ({
  ...state,
  count: state.count + 1
}));
// export type TestIncrement = typeof testIncrement["act"];

export const testDelta = generateSync(
  "TEST_DELTA",
  ({ delta }: { delta: number }, state: State) => ({
    ...state,
    count: state.count + delta
  })
);
// export type TestDelta = typeof testDelta["act"];

export const testDecrement = generateSync("TEST_DECREMENT", ({  }: {}, state: State) => ({
  ...state,
  count: state.count - 1
}));
// export type TestDecrement = typeof testDecrement["act"];

//#endregion

export const testPingInfoThunk = generateThunk("TEST_THUNK", ({ state: { test } }, {}): string =>
  test.lastPing ? `Last ping was ${test.lastPing}` : "No pings seen"
);

export type ThunkAction = ReturnType<typeof testPingInfoThunk>;

export type Action =
  | ReturnType<typeof testPing["act"]>
  | ReturnType<typeof testIncrement["act"]>
  | ReturnType<typeof testDelta["act"]>
  | ReturnType<typeof testDecrement["act"]>;

export function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case "TEST_DECREMENT":
      return testDecrement.def(action, state);
    case "TEST_INCREMENT":
      return testIncrement.def(action, state);
    case "TEST_DELTA":
      return testDelta.def(action, state);
    case "TEST_PING":
      return testPing.def(action, state);
    default:
      return state || testNever(action);
  }
}
