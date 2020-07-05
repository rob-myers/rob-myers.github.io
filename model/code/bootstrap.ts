import { REFRESH_REG, REFRESH_SIG, REFRESH_HELPERS, REFRESH_INTERCEPT_MODULE_EXECUTION } from './dev-env.model';

/**
 * Get code for a module which will bootstrap a single instance of the App.
 */
export const getAppBootstrapCode = (appEsmUrl: string, elementId: string) => `

import App from '${appEsmUrl}';
import React from '${window.location.origin}/es-react/react.js';
import ReactDOM from '${window.location.origin}/es-react/react-dom.js';
import { ErrorBoundary } from '${window.location.origin}/error-boundary.js';

const rootEl = document.getElementById('${elementId}');
ReactDOM.unmountComponentAtNode(rootEl);

const WrappedApp = React.createElement(ErrorBoundary, null, React.createElement(App));
ReactDOM.render(WrappedApp, rootEl);
`.trim();

/**
 * Get code for a module used to bootstrap react-refresh.
 */
export const getReactRefreshBootstrapCode = () => `

import RefreshRuntime from '${window.location.origin}/es-react-refresh/runtime.js'
// import RefreshHelpers from '${window.location.origin}/es-react-refresh/helpers.js'

const self = window;

// Hook into ReactDOM initialization
RefreshRuntime.injectIntoGlobalHook(self)

// noop fns to prevent runtime errors during initialization
self.${REFRESH_REG} = function () {}
self.${REFRESH_SIG} = function () {
  return function (type) {
    return type
  }
}

// Register global helpers
// self.${REFRESH_HELPERS} = RefreshHelpers

// Register a helper for module execution interception
self.${REFRESH_INTERCEPT_MODULE_EXECUTION} = function (filename) {
  var prevRefreshReg = self.${REFRESH_REG}
  var prevRefreshSig = self.${REFRESH_SIG}

  self.${REFRESH_REG} = function (type, id) {
    RefreshRuntime.register(type, filename + ' ' + id)
  }
  self.${REFRESH_SIG} = RefreshRuntime.createSignatureFunctionForTransform

  // Modeled after \`useEffect\` cleanup pattern:
  // https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  return function () {
    self.${REFRESH_SIG} = prevRefreshReg
    self.${REFRESH_SIG} = prevRefreshSig
  }
}
`.trim();