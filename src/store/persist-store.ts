import { createTransform } from "redux-persist";
import { State as TestState, SerializedState as TestSerializedState } from "./test.duck";
// import { State as TopDownState, SerializedState as TopDownSerializedState } from "./top-down.duck";

/**
 * Test.
 */
export const persistTestTransform = createTransform(
  /**
   * Transform state on its way to being serialized and persisted.
   */
  ({ count, lastPing }: TestState, _key): TestSerializedState => ({
    count,
    lastPing: lastPing ? `${lastPing}` : null
  }),
  /**
   * Rehydrate state from serialization.
   */
  ({ count, lastPing }: TestSerializedState, _key): TestState => ({
    count,
    // lastPing: lastPing ? new Date(lastPing) : null
    lastPing
  }),
  /**
   * Define which reducers this transform gets called for.
   */
  { whitelist: ["test"] }
);

// export const persistTopDownTransform = createTransform(
//   ({  }: TopDownState, _key): TopDownSerializedState => ({
//     /**
//      * Currently do not persist.
//      */
//     lookup: {}
//   }),
//   ({ lookup }: TopDownSerializedState, _key): TopDownState => ({
//     lookup
//   }),
//   { whitelist: ["topDown"] }
// );
