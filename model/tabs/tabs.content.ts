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

export async function getCode(key: CodeFilepathKey) {
  return code[key]().then(x => x.default);
}

export type CodeFilepathKey = keyof typeof code;
