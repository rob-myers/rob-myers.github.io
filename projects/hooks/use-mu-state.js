import React from 'react';

/**
 * Effectively `const [state] = React.useState(() => ...)` with better HMR.
 * @template {Record<string, any> & { _prevFn?: string }} State 
 * @param {() => State} initializer Should be side-effect free...
 */
export default function useMuState(initializer) {
  const [state] = React.useState(initializer);

  React.useEffect(() => {
    const changed = initializer.toString() !== state._prevFn;
    if (!state._prevFn) {// Initial mount
      state._prevFn = initializer.toString();
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
      }
      for (const [k, v] of Object.entries(state)) {
        if (!(k in newInit)) delete state[k];
      }
      state._prevFn = initializer.toString();
    }
  }, []);

  return state;
}