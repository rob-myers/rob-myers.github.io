import PanZoomDemo from 'projects/demo/PanZoomDemo';
import panZoomJsx from '!!raw-loader!projects/components/PanZoom.jsx';

export const code = {
  'components/PanZoom.jsx': panZoomJsx,
} as const;

export const component = {
  PanZoomDemo,
} as const;

export type ComponentKey = keyof typeof component;

export type CodeFilepathKey = keyof typeof code;
