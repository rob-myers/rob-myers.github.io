export const bootstrapApp = (appEsmUrl: string, elementId: string) => `
import App from '${appEsmUrl}';
import React from '${window.location.origin}/es-react/react.js';
import ReactDom from '${window.location.origin}/es-react/react-dom.js';
import { ErrorBoundary } from '${window.location.origin}/error-boundary.js';

ReactDom.render(
  React.createElement(ErrorBoundary, null, React.createElement(App)),
  document.getElementById('${elementId}'),
);
`.trim();
