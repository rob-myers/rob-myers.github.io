import PanZoomDemo from 'projects/panzoom/PanZoomDemo';
import NavDemo from 'projects/nav/NavDemo';
import GeomorphDemo from 'projects/geomorph/GeomorphDemo';
import Images from 'projects/example/Images';

import panZoomJsx from '!!raw-loader!projects/panzoom/PanZoom.jsx';
import panZoomDemoJsx from '!!raw-loader!projects/panzoom/PanZoomDemo.jsx';
import navDemoJsx from '!!raw-loader!projects/nav/NavDemo.jsx';
import jsxToJs from '!!raw-loader!projects/example/jsx-to-js.jsx';
import GeomRect from '!!raw-loader!projects/geom/rect';

export const code = {
  'panzoom/PanZoom.jsx': panZoomJsx,
  'panzoom/PanZoomDemo.jsx': panZoomDemoJsx,
  'nav/NavDemo.jsx': navDemoJsx,
  'example/jsx-to-js.jsx': jsxToJs,
  'geom/rect.js': GeomRect,
} as const;

export const component = {
  'panzoom/PanZoomDemo.jsx': PanZoomDemo,
  'nav/NavDemo.jsx': NavDemo,
  'geomorph/GeomorphDemo.jsx': GeomorphDemo,
  'example/Images.jsx': Images,
} as const;

export type ComponentFilepathKey = keyof typeof component;

export type CodeFilepathKey = keyof typeof code;

if (module.hot) {
  // Avoid breaking preact-prefresh of raw-loader imported jsx
  module.hot.accept();
}
