import * as React from 'react';
import SvgPanZoomDemo from './SvgPanZoomDemo';

const withJsx = <div title="message">Welcome!</div>;
const withoutJsx = React.createElement(
  'div',
  { title: 'message' },
  'Welcome!',
);

const withJsxToo = <div><SvgPanZoomDemo /></div>;
const withoutJsxToo = React.createElement(
  'div',
  null,
  React.createElement(SvgPanZoomDemo, null),
);
