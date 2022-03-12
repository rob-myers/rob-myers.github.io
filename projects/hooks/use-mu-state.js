import React from 'react';
import { equals } from '../service/generic';

/**
 * Roughly speaking, this hook is
 * > `const [state] = React.useState(() => initState)`
 * 
 * together with dependencies and (crucially) better HMR.
 * @template State 
 * @param {() => State} initializer Should be side-effect free...
 * @param {any[]} [deps]
 * @param {{ equality?: TypeUtil.KeyedTrue<State>; }} [opts]
 */
export default function useMuState(
  initializer,
  deps = [],
  opts = {},
) {
  const [state] = /**
    @type {[State & { _prevFn?: string; _prevInit?: State; onChangeDeps?: () => void; }, any]}
  */ (
    React.useState(initializer)
  );

  React.useEffect(() => {
    const changed = initializer.toString() !== state._prevFn;

    if (!state._prevFn) {
      /**
       * Initial mount
       * TODO avoid in production
       */
      state._prevFn = initializer.toString();
      state._prevInit = initializer();
    } else if (changed) {// HMR and `initializer` has changed
      /**
       * Attempt to update state using new initializer:
       * - update all functions
       * - add new properties
       * - remove stale keys
       */
      const newInit = initializer();
      for (const [k, v] of Object.entries(newInit)) {
        const key = /** @type {keyof State} */ (k);
        if (typeof v === 'function') {
          state[key] = v;
        } else if (// Also update setters and getters
          Object.getOwnPropertyDescriptor(state, key)?.get
          || Object.getOwnPropertyDescriptor(state, key)?.set
        ) {
          Object.defineProperty(state, key, {
            get: Object.getOwnPropertyDescriptor(newInit, key)?.get,
            set: Object.getOwnPropertyDescriptor(newInit, key)?.set,
          });
        } else if (!(k in state)) {
          state[key] = v;
        }
        /**
         * IN PROGRESS
         * - update if equality checking specified and initial values changed
         * - TODO automatic for primitive types
         */
        else if (
          state._prevInit && opts.equality?.[key] &&
          !equals((state._prevInit)[key], newInit[key])
        ) {
          state[key] = newInit[key];
        }
      }
      for (const [k, v] of Object.entries(state)) {
        if (!(k in newInit)) delete state[/** @type {keyof State} */ (k)];
      }
      state._prevFn = initializer.toString();
      state._prevInit = newInit;

      const cleanup = state.onChangeDeps?.();
      if (typeof cleanup === 'function') {
        return cleanup;
      }
    } else {
      /**
       * Deps changed, so update function bodies
       */
      const newInit = initializer();
      for (const [k, v] of Object.entries(newInit)) {
        if (typeof v === 'function') {
          (state)[/** @type {keyof State} */ (k)] = v;
        } else if (// Also update setters and getters
          Object.getOwnPropertyDescriptor(state, k)?.get
          || Object.getOwnPropertyDescriptor(state, k)?.set
        ) {
          Object.defineProperty(state, k, {
            get: Object.getOwnPropertyDescriptor(newInit, k)?.get,
            set: Object.getOwnPropertyDescriptor(newInit, k)?.set,
          });
        }
      }

      const cleanup = state.onChangeDeps?.();
      if (typeof cleanup === 'function') {
        return cleanup;
      }
    }
  }, deps);

  return /** @type {State} */ (state);
}
