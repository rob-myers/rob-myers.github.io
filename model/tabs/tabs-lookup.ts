import PanZoomDemo from 'projects/demo/PanZoomDemo';
import panZoomJsx from '!!raw-loader!projects/components/PanZoom.jsx';
import React from 'react';

export const code = {
  'components/PanZoom.jsx': panZoomJsx,
};

export const component = {
  PanZoomDemo,
} as Record<string, React.FC>;
