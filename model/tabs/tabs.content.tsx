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
  'example/Gm301Debug': () => import('projects/example/Gm301Debug'),
  'geomorph/GeomorphDemo': () => import('projects/geomorph/GeomorphDemo'),
  'panzoom/PanZoomDemo': () => import('projects/panzoom/PanZoomDemo'),
  'nav/DoorsDemo#101': () => import('projects/nav/DoorsDemo')
      .then(x => () => <x.default layoutKey='g-101--multipurpose' />),
  'nav/DoorsDemo#301': () => import('projects/nav/DoorsDemo')
      .then(x => () => <x.default layoutKey='g-301--bridge' />),
  'nav/NavDemo': () =>
    import('projects/nav/NavDemo'),
};

export async function getCode(key: CodeFilepathKey) {
  return code[key]?.().then(x => x.default)
    || `Code not found: ${key}`;
}

export async function getComponent(key: ComponentFilepathKey) {
  return component[key]?.().then(x => 'default' in x ? x.default : x)
    || (() => React.createElement('div', null, `Component not found: ${key}`));
}

export type CodeFilepathKey = keyof typeof code;
export type ComponentFilepathKey = keyof typeof component;

// TODO remove
if (module.hot) {
  // Avoid breaking preact-prefresh of raw-loader imported jsx
  module.hot.accept();
}
