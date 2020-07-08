import RefreshRuntime from './runtime';
import RefreshHelpers from './helpers';
import React from '../es-react/react';
import { REFRESH_HELPERS, REFRESH_REG, REFRESH_SIG, LIVE_REACT } from '../constants';

if (typeof window !== 'undefined') {
  /**
   * Hook into ReactDOM initialization
   * See also @next/react-refresh-utils/runtime.js
   * which also injects into global hook.
   */
  // console.log('RefreshRuntime injecting into global hook')
  RefreshRuntime.injectIntoGlobalHook(window)
  
  window[REFRESH_REG] = function (filename, type, id) {
    RefreshRuntime.register(type, filename + ' ' + id)
  }
  window[REFRESH_SIG] = RefreshRuntime.createSignatureFunctionForTransform
  
  // Register global helpers
  window[REFRESH_HELPERS] = RefreshHelpers
  
  /**
   * We need the dynamic app module to refer to the same `react`.
   * We tried `import * as React from ${window.location.origin}/es-react/react.js`
   * inside dynamic module but it yields a different copy of react,
   * because the module specifier is different.
   */
  window[LIVE_REACT] = React;
}
