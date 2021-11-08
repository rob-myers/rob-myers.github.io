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
  'example/Gm301Debug': () => import('projects/example/Gm301')
    .then(x => x.default),
  'example/Light#301': () => import('projects/example/Light')
    .then(x => (props: any) => <x.default disabled {...props} layoutKey='g-301--bridge' />),
  'example/Css3d#301': () => import('projects/example/Css3d')
    .then(x => (props: any) => <x.default {...props} layoutKey='g-301--bridge' />),
  'geomorph/GeomorphDemo': () => import('projects/example/GeomorphDemo')
    .then(x => x.default),
  'panzoom/PanZoomDemo': () => import('projects/panzoom/PanZoomDemo')
    .then(x => x.default),
  'nav/DoorsDemo#101': () => import('projects/nav/DoorsDemo')
    .then(x => (props: any) => <x.default {...props} layoutKey='g-101--multipurpose' />),
  'nav/DoorsDemo#301': () => import('projects/nav/DoorsDemo')
    .then(x => (props: any) => <x.default {...props} layoutKey='g-301--bridge' />),
  'nav/NavDemo': () => import('projects/nav/NavDemo')
    .then(x => x.default),
};

export async function getCode(key: CodeFilepathKey) {
  return code[key]?.().then(x => x.default) || (
    `Code not found: ${key}`
  );
}

export async function getComponent(key: ComponentFilepathKey) {
  return component[key]?.() || (
    () => <div>Component not found: {key}</div>
  );
}

export type CodeFilepathKey = keyof typeof code;
export type ComponentFilepathKey = keyof typeof component;

// TODO remove
if (module.hot) {
  // Avoid breaking preact-prefresh of raw-loader imported jsx
  module.hot.accept();
}
