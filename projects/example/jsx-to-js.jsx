import * as React from 'react';
import PanZoomDemo from '../panzoom/PanZoomDemo';

// With JSX
const node = <div title="message">Welcome!</div>;
// Without JSX
const sameNode = React.createElement(
  'div', { title: 'message' }, 'Welcome!',
);

// With JSX
const altNode = <div><PanZoomDemo /></div>;
// Without JSX
const sameAltNode = React.createElement(
  'div', null, React.createElement(PanZoomDemo, null),
);