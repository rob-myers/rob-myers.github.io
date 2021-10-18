import React from 'react';

const code = {
  'panzoom/PanZoom.jsx': () =>
    import('!!raw-loader!projects/panzoom/PanZoom.jsx'),
  'panzoom/PanZoomDemo.jsx': () =>
    import('!!raw-loader!projects/panzoom/PanZoomDemo.jsx'),
  'nav/NavDemo.jsx': () =>
    import('!!raw-loader!projects/nav/NavDemo.jsx'),
  'example/jsx-to-js.jsx': () =>
    import('!!raw-loader!projects/example/jsx-to-js.jsx'),
  'geom/rect.js': () =>
    import('!!raw-loader!projects/geom/rect'),
} as const;

const component = {
  'panzoom/PanZoomDemo': () =>
    import('projects/panzoom/PanZoomDemo'),
  'nav/NavDemo': () =>
    import('projects/nav/NavDemo'),
  'geomorph/GeomorphDemo': () =>
    import('projects/geomorph/GeomorphDemo'),
  /** example/images.jsx Gm301Debug */
  'images/Gm301Debug': () =>
    import('projects/example/images'),
};

export async function getCode(key: CodeFilepathKey) {
  return code[key]?.().then(x => x.default)
    || `Code not found: ${key}`;
}

export async function getComponent(key: ComponentFilepathKey) {
  return component[key]?.().then(x => x.default)
    || (() => React.createElement('div', null, `Component not found: ${key}`));
}

export type CodeFilepathKey = keyof typeof code;
export type ComponentFilepathKey = keyof typeof component;

// TODO remove
if (module.hot) {
  // Avoid breaking preact-prefresh of raw-loader imported jsx
  module.hot.accept();
}
