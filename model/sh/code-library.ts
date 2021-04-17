import { getWindow } from "model/dom.model";

export const preloadedFunctions = {
  range: `call '(_, x) => [...Array(Number(x))].map((_, i) => i)' "$1"`,
  seq: `range "$1" | split`,
  filter: `map -x "fn = $1; return (...args) => fn(...args) ? args[0] : undefined"`,
  /** We don't support backticks in the argument */
  jarg: `call '() => {
    try { return Function("_", \`return '\${1:-\\"\\"}'\` )(); }
    catch { return JSON.stringify(\`'$1'\`); }
}'
`,
  reduce: `sponge | {
  test '/\\S/' "$2" \\
    && map "x => x.reduce($1, $( jarg "$2" ) )" \\
    || map "x => x.reduce($1)"
}
`,
  pretty: `map '(x, { util: {stringify} }) => stringify(x)'`,
  keys: `map Object.keys`,
  cat: `get "$@" | split`,
 
  sel: `run '({ read, Geom }, { stage: { selection } }) {
    const input = await read();
    if (input) {
      selection.polygons = (Array.isArray(input) ? input : [input])
        .map(x => Geom.Polygon.from(x))
        .filter(x => x.outer.length);
    }
    yield selection.polygons.map(x => x.json);
}'
`,
};

const navigator = getWindow()?.navigator;

export const preloadedVariables = {
  navigator: {
    platform: navigator?.platform??'',
    userAgent: navigator?.userAgent??'',
  },
};

export const shellScripts = {

  brushKeyHandler: `
key | run '({ read, _: {msg} }, { stage: s }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !s.opts.enabled) continue;
    // TODO
    // switch (msg.key) {
    //   case "f": s.brush.paint(); break;
    //   case "v": msg.metaKey && s.brush.paint(); break;
    //   case "F": s.brush.erase(); break;
    //   case "Backspace": s.brush.erase(); break;
    //   case "c": msg.metaKey && s.brush.select(); break;
    //   case "x": msg.metaKey ? s.brush.cutSelect()
    //     : s.brush.transform("mirror(x)"); break;
    //   case "Escape": s.brush.deselect(); break;
    //   case "y": s.brush.transform("mirror(y)"); break;
    //   case "q": s.brush.transform("rotate(90)"); break;
    //   case "Q": s.brush.transform("rotate(-90)"); break;
    //   case "z": msg.metaKey && s.brush.undoRedo(); break;
    // }
  }
}' &
`,

  optsKeyHandler: `
key | run '({ read, _: {msg} }, { stage: { opts } }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !opts.enabled) continue;
    switch (msg.key) {
      // case "1": opts.wallOpacity = 0; break;
      // case "2": opts.wallOpacity = 1; break;
      // case "3": opts.wallOpacity = 0.4; break;
      case "l": opts.lights = !opts.lights; break;
    }
  }
}' &
`,
};

export const profiles = {
  first: `
await-stage "\${STAGE_KEY}"

${shellScripts.brushKeyHandler.trim()}

${shellScripts.optsKeyHandler.trim()}
`.trim(),
};
