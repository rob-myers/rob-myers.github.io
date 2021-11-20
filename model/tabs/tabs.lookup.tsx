import React from 'react';

const code = {
  'panzoom/PanZoom.jsx': () =>
    import('!!raw-loader!projects/panzoom/PanZoom.jsx'),
  'example/PanZoomDemo.jsx': () =>
    import('!!raw-loader!projects/example/PanZoomDemo.jsx'),
  'example/NavStringPull.jsx': () =>
    import('!!raw-loader!projects/example/NavStringPull.jsx'),
  'example/jsx-to-js.jsx': () =>
    import('!!raw-loader!projects/example/jsx-to-js.jsx'),
  'geom/rect.js': () =>
    import('!!raw-loader!projects/geom/rect'),
} as const;

const component = {
  'example/Gm301Debug': () => import('projects/example/Gm301')
    .then(x => x.default),
  'example/Visibility#301': () => import('projects/example/Visibility')
    .then(x => (props: any) => <x.default disabled {...props} layoutKey='g-301--bridge' />),
  'example/Css3d#301': () => import('projects/example/Css3d')
    .then(x => (props: any) => <x.default {...props} layoutKey='g-301--bridge' />),
  'example/GeomorphEdit': () => import('projects/example/GeomorphEdit')
    .then(x => x.default),
  'example/PanZoomDemo': () => import('projects/example/PanZoomDemo')
    .then(x => x.default),
  'example/DoorsDemo#101': () => import('projects/example/DoorsDemo')
    .then(x => (props: any) => <x.default {...props} layoutKey='g-101--multipurpose' />),
  'example/DoorsDemo#301': () => import('projects/example/DoorsDemo')
    .then(x => (props: any) => <x.default {...props} layoutKey='g-301--bridge' />),
  'example/NavStringPull': () => import('projects/example/NavStringPull')
    .then(x => (props:any) => <x.default disabled {...props} />),
  'example/NavGraph#301': () => import('projects/example/NavGraph')
    .then(x => (props: any) => <x.default disabled {...props} layoutKey='g-301--bridge' />),
  'example/NavGraph#302': () => import('projects/example/NavGraph')
    .then(x => (props: any) => <x.default disabled {...props} layoutKey='g-302--xboat-repair-bay' />),
  'example/NavCollide': () => import('projects/example/NavCollide')
    .then(x => (props: any) => <x.default disabled {...props} />),
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