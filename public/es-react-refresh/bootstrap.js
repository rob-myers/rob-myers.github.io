import RefreshRuntime from './runtime';

if (typeof window !== 'undefined') {
  /**
   * Hook into ReactDOM initialization, see also:
   * @next/react-refresh-utils/runtime.js
   */
  RefreshRuntime.injectIntoGlobalHook(window);
}

import RefreshHelpers from './helpers';
// import React from '../es-react/react';

import { REFRESH_HELPERS, REFRESH_REG, REFRESH_SIG, LIVE_REACT, LIVE_REACT_REDUX } from '../constants';

if (typeof window !== 'undefined') {    
  window[REFRESH_REG] = function (filename, type, id) {
    RefreshRuntime.register(type, filename + ' ' + id)
  }
  window[REFRESH_SIG] = RefreshRuntime.createSignatureFunctionForTransform;
  
  // Register global helpers (unused?)
  window[REFRESH_HELPERS] = RefreshHelpers;
  
  /**
   * We need the dynamic app module to refer to the same `react`.
   * We tried `import * as React from ${window.location.origin}/es-react/react.js`
   * inside dynamic module but it yields a different copy of react,
   * because the module specifier is different.
   */
  // window[LIVE_REACT] = React;
  import('../es-react/react').then((imported) =>
    window[LIVE_REACT] = imported);

  /**
   * Import dynamically because was silently breaking react-refresh,
   * presumably via early reference to es-react/react-dom inside
   * public/es-react-redux/utils/reactBatchedUpdates.js.
   */
  import('../es-react-redux').then((imported) =>
    window[LIVE_REACT_REDUX] = imported);
}

export default function preventTreeShake() {}
