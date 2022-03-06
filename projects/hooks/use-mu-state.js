import React from 'react';

/**
 * This hook should be thought of as `const [state] = React.useState(() => initState)`
 * together with dependencies and (crucially) better HMR.
 * @template State 
 * @param {() => State} initializer Should be side-effect free...
 * @param {TypeUtil.KeyedEquality<State>} [keyEquality]
 * @param {any[]} [deps]
 */
export default function useMuState(
  initializer,
  keyEquality = {},
  deps = [],
) {
  const [state] = /** @type {[State & { _prevFn?: string; _prevInit?: State }, any]} */ (
    React.useState(initializer)
  );

  React.useEffect(() => {
    const changed = initializer.toString() !== state._prevFn;

    if (!state._prevFn) {// Initial mount
      // TODO avoid in production
      state._prevFn = initializer.toString();
      state._prevInit = initializer();
    } else if (changed) {// HMR and `initializer` has changed
      /**
       * _Attempt_ to update state using new initializer:
       * - update all functions
       * - add new properties
       * - remove stale keys
       */
      const newInit = initializer();
      for (const [k, v] of Object.entries(newInit)) {
        const key = /** @type {keyof State} */ (k);
        if (typeof v === 'function') state[key] = v;
        else if (!(k in state)) state[key] = v;
        /**
         * _IN PROGRESS_ update if initial values changed
         * TODO automatic for primitive types
         */
        else if (state._prevInit && keyEquality[key]?.((state._prevInit)[key], newInit[key]) === false) {
          state[key] = newInit[key];
        }
      }
      for (const [k, v] of Object.entries(state)) {
        if (!(k in newInit)) delete state[/** @type {keyof State} */ (k)];
      }
      state._prevFn = initializer.toString();
      state._prevInit = newInit;
    } else {// Deps changed, so update function bodies
      const newInit = initializer();
      for (const [k, v] of Object.entries(newInit)) {
        if (typeof v === 'function') (state)[/** @type {keyof State} */ (k)] = v;
      }
    }
  }, deps);

  return /** @type {State} */ (state);
}