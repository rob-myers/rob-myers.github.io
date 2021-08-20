import PanZoomDemo from 'projects/panzoom/PanZoomDemo';
import panZoomJsx from '!!raw-loader!projects/panzoom/PanZoom.jsx';
import panZoomDemoJsx from '!!raw-loader!projects/panzoom/PanZoomDemo.jsx';
import withJsx from '!!raw-loader!projects/example/with-jsx.jsx';
import withoutJsx from '!!raw-loader!projects/example/without-jsx.js';

export const code = {
  'panzoom/PanZoom.jsx': panZoomJsx,
  'panzoom/PanZoomDemo.jsx': panZoomDemoJsx,
  'example/with-jsx.jsx': withJsx,
  'example/without-jsx.js': withoutJsx,
} as const;

export const component = {
  'panzoom/PanZoomDemo.jsx': PanZoomDemo,
} as const;

export type ComponentFilepathKey = keyof typeof component;

export type CodeFilepathKey = keyof typeof code;

if (module.hot) {
  // Avoid breaking fast-refresh of raw-loader imported jsx
  module.hot.accept();
}
