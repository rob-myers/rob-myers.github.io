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
    } else {
      yield selection.polygons.map(x => x.json);
    }
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

  selectionKeyHandler: `
key | run '({ read, _: {msg} }, { stage: { opts, sel } }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !opts.enabled || !sel.enabled) {
      continue;
    }
    if (sel.locked) {
      // TODO
    } else {
      switch (msg.key) {
        case "z": msg.metaKey && ([sel.polygons, sel.prevPolys] = [sel.prevPolys, sel.polygons]); break;
      }
    }
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

${shellScripts.selectionKeyHandler.trim()}

${shellScripts.optsKeyHandler.trim()}

`.trim(),
};
