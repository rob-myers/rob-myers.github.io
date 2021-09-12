import PanZoomDemo from 'projects/panzoom/PanZoomDemo';
import panZoomJsx from '!!raw-loader!projects/panzoom/PanZoom.jsx';
import panZoomDemoJsx from '!!raw-loader!projects/panzoom/PanZoomDemo.jsx';

import NavDemo from 'projects/pathfinding/NavDemo';
import navDemoJsx from '!!raw-loader!projects/pathfinding/NavDemo.jsx';

import GeomorphDemo from 'projects/geomorph/GeomorphDemo';
import PhysicsDemo from 'projects/physics/PhysicsDemo';
import jsxToJs from '!!raw-loader!projects/example/jsx-to-js.jsx';

import GeomRect from '!!raw-loader!projects/geom/rect';

export const code = {
  'panzoom/PanZoom.jsx': panZoomJsx,
  'panzoom/PanZoomDemo.jsx': panZoomDemoJsx,
  'pathfinding/NavDemo.jsx': navDemoJsx,
  'example/jsx-to-js.jsx': jsxToJs,
  'geom/rect.js': GeomRect,
} as const;

export const component = {
  'panzoom/PanZoomDemo.jsx': PanZoomDemo,
  'pathfinding/NavDemo.jsx': NavDemo,
  'geomorph/GeomorphDemo.jsx': GeomorphDemo,
  'physics/PhysicsDemo.jsx': PhysicsDemo,
} as const;

export type ComponentFilepathKey = keyof typeof component;

export type CodeFilepathKey = keyof typeof code;

if (module.hot) {
  // Avoid breaking fast-refresh of raw-loader imported jsx
  module.hot.accept();
}
