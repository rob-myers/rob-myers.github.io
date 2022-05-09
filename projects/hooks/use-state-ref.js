import React from 'react';
import { equals, isPlainObject } from '../service/generic';

/**
 * This hook is a mixture between React.useState and React.useRef.
 * - It outputs an object `state` which is always the same object, but may be mutated.
 * - Its `initializer` is typically properties and an API for mutating it.
 * - On HMR it will update these properties "suitably", relative to options.
 * 
 * @template State 
 * @param {() => State} initializer Should be side-effect free...
 * @param {{ overwrite?: TypeUtil.KeyedTrue<State>; deps?: any[]; deeper?: (keyof State)[] }} [opts]
 */
export default function useStateRef(
  initializer,
  opts = {},
) {
    const [state] = /**
      @type {[State & { _prevFn?: string; _prevInit?: State; }, any]}
    */ (
      React.useState(initializer)
    );

    React.useMemo(() => {
      const changed = initializer.toString() !== state._prevFn;

      if (!state._prevFn) {// Initial mount
        // TODO avoid in production
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
          // console.log({ key: k })
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
            // console.log({ setting: [k, v] })
            state[key] = v;
          } else if (
            state._prevInit && opts.overwrite?.[key]
            && !equals((state._prevInit)[key], newInit[key])
          ) {// Update if initial values changed and specified `overwrite`
            state[key] = newInit[key];
          } else if (
            state._prevInit && opts.deeper?.includes(key)
            && isPlainObject(newInit)
          ) {
            // Sometimes functions and getter/setters are inside a top-level object
            // We could support arbitrary depth, but choose not to
            const innerNewInit = newInit[key];
            const innerState = /** @type {Record<string, any>} */ state[key];
            for (const [innerK, innerV] of Object.entries(innerNewInit)) {
              const innerKey = /** @type {keyof typeof innerState} */ (innerK);
              if (typeof innerV === 'function') {
                innerState[innerKey] = innerV;
              } else if (// Also update setters and getters
                Object.getOwnPropertyDescriptor(innerState, innerKey)?.get
                || Object.getOwnPropertyDescriptor(innerState, innerKey)?.set
              ) {
                Object.defineProperty(innerState, innerKey, {
                  get: Object.getOwnPropertyDescriptor(innerNewInit, innerKey)?.get,
                  set: Object.getOwnPropertyDescriptor(innerNewInit, innerKey)?.set,
                });
              } 
            }
          }
        }

        for (const k of Object.keys(state)) {
          if (!(k in newInit) && !['_prevFn', '_prevInit'].includes(k)) {
            // console.log({ deleting: k })
            delete state[/** @type {keyof State} */ (k)];
          }
        }

        state._prevFn = initializer.toString();
        state._prevInit = newInit;
      } else {// HMR and `initializer` has not changed
        // e.g. HMR triggered from elsewhere
        // e.g. `opts.deps` have changed
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
      }
    }, opts.deps || []);

    return /** @type {State} */ (state);
}

module.hot?.decline();
