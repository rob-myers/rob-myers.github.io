import React from 'react';

/**
 * Effectively `const [state] = React.useState(() => ...)` with better HMR.
 * @template {Record<string, any> & { _prevFn?: string, _prevInit?: State }} State 
 * @param {() => State} initializer Should be side-effect free...
 * @param {TypeUtil.KeyedEquality<State>} [keyEquality]
 * @param {any[]} [deps]
 */
export default function useMuState(
  initializer,
  keyEquality = {},
  deps = [],
) {
  const [state] = React.useState(initializer);

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
        if (typeof v === 'function') /** @type {*} */ (state)[k] = v;
        else if (!(k in state)) /** @type {*} */ (state)[k] = v;
        /**
         * _IN PROGRESS_ update if initial values changed
         * TODO automatic for primitive types
         */
        else if (state._prevInit && keyEquality[k]?.(/** @type {State} */ (state._prevInit)[k], newInit[k]) === false) {
          /** @type {*} */ (state)[k] = newInit[k];
        }
      }
      for (const [k, v] of Object.entries(state)) {
        if (!(k in newInit)) delete state[k];
      }
      state._prevFn = initializer.toString();
      state._prevInit = newInit;
    } else {// Deps changed: update function bodies
      const newInit = initializer();
      for (const [k, v] of Object.entries(newInit)) {
        if (typeof v === 'function') /** @type {*} */ (state)[k] = v;
      }
    }
  }, deps);

  return state;
}