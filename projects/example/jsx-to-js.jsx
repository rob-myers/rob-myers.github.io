import * as React from 'react';
import PanZoomDemo from './PanZoomDemo';

const withJsx = <div title="message">Welcome!</div>;
const withoutJsx = React.createElement(
  'div',
  { title: 'message' },
  'Welcome!',
);

const withJsxToo = <div><PanZoomDemo /></div>;
const withoutJsxToo = React.createElement(
  'div',
  null,
  React.createElement(PanZoomDemo, null),
);