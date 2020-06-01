export const bootstrapApp = (appEsmUrl: string, elementId: string) => `
import App from '${appEsmUrl}';
import React from '${window.location.origin}/es-react/react.js';
import ReactDOM from '${window.location.origin}/es-react/react-dom.js';
import { ErrorBoundary } from '${window.location.origin}/error-boundary.js';

const rootEl = document.getElementById('${elementId}');
ReactDOM.unmountComponentAtNode(rootEl);

const WrappedApp = React.createElement(ErrorBoundary, null, React.createElement(App));
ReactDOM.render(WrappedApp, rootEl);
`.trim();
