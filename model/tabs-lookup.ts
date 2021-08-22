import PanZoomDemo from 'projects/panzoom/PanZoomDemo';
import panZoomJsx from '!!raw-loader!projects/panzoom/PanZoom.jsx';
import panZoomDemoJsx from '!!raw-loader!projects/panzoom/PanZoomDemo.jsx';
import jsxToJs from '!!raw-loader!projects/example/jsx-to-js.jsx';

export const code = {
  'panzoom/PanZoom.jsx': panZoomJsx,
  'panzoom/PanZoomDemo.jsx': panZoomDemoJsx,
  'example/jsx-to-js.jsx': jsxToJs,
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
