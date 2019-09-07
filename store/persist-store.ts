import { createTransform } from "redux-persist";
import { State as TestState, SerializedState as TestSerializedState } from "./test.duck";

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
    lastPing: lastPing ? (new Date(lastPing)).toString() : null
  }),
  /**
   * Define which reducers this transform gets called for.
   */
  { whitelist: ["test"] }
);
