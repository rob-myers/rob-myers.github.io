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
  pretty: `map '(x, { stringify }) => stringify(x)'`,
  keys: `map Object.keys`,
  cat: `get "$@" | split`,
 
  sel: `run '({ read, use: {Geom} }, { stage: {sel} }) {
    const input = await read();
    if (input) {
    sel.wall = input.map(x => Geom.Polygon.from(x))
        .filter(x => x.outer.length);
    } else {
      yield sel.wall.map(x => x.json);
    }
}'
`,
};

export const preloadedVariables = {
};

export const shellScripts = {

  lockedSelectionKeyHandler: `
# locked selection key handler
key | run '({ read, use: {THREE}, _: {msg} }, { stage: { opts, sel } }) {
  while (msg = await read()) {
    if (![msg.type === "keyup", opts.enabled, sel.enabled,
      sel.locked, !msg.metaKey].every(Boolean)) continue;
    switch (msg.key) {
      case "x": {
        const matrix = (new THREE.Matrix4).makeScale(1, -1, 1)
        .setPosition(0, 2 * sel.localBounds.cy, 0);
        sel.group.matrix.multiply(matrix);
        break;
      }
      case "y": {
        const matrix = (new THREE.Matrix4).makeScale(-1, 1, 1)
          .setPosition(2 * sel.localBounds.cx, 0, 0);
        sel.group.matrix.multiply(matrix);
        break;
      }
      case "q":
      case "Q": {
        const { cx, cy } = sel.bounds;
        const angle = (msg.key === "Q" ? -1 : 1) * (Math.PI / 2);
        sel.group.matrix.premultiply(
          (new THREE.Matrix4).makeTranslation(-cx, -cy, 0)
          .premultiply((new THREE.Matrix4).makeRotationZ(angle))
          .premultiply((new THREE.Matrix4).makeTranslation(cx, cy, 0))
        );
        break;
      }
    }
  }
}' &
  `,

  selectionKeyHandler: `
# selection key handler
key | run '({ read, use: {geom, Geom}, _: {msg} }, { stage: { opts, sel, poly } }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !opts.enabled || !sel.enabled) continue;
    if (msg.metaKey) {
      switch (msg.key) {
        case "c":
        case "x": {
          const bounds = sel.bounds, delta = Geom.Polygon.from(bounds);
          sel.wall = poly.wall.filter(poly => poly.rect.intersects(bounds))
            .flatMap(poly => geom.intersect([delta, poly]));
          sel.locked = true;
          if (msg.key === "x") {
            [poly.prevWall, poly.wall] = [poly.wall, geom.cutOut([delta], poly.wall)];
          }
          break;
        }
        case "v": sel.locked &&
          ([poly.prevWall, poly.wall] = [poly.wall, geom.union(poly.wall.concat(sel.wall))]);
          break;
        case "z":
          ([poly.prevWall, poly.wall] = [poly.wall, poly.prevWall]);
          break;
      }
    } else {
      switch (msg.key) {
        case "f": {
          if (sel.locked) break;
          const delta = Geom.Polygon.from(sel.bounds);
          [poly.prevWall, poly.wall] = [poly.wall, geom.union(poly.wall.concat(delta))];
          break;
        }
        case "F":
        case "Backspace": {
          if (sel.locked) break;
          const delta = Geom.Polygon.from(sel.bounds);
          [poly.prevWall, poly.wall] = [poly.wall, geom.cutOut([delta], poly.wall)];
          break;
        }
        case "Escape":
          sel.localBounds = new Geom.Rect(0, 0, 0, 0);
          sel.localWall = [];
          sel.locked = false;
          break;
      }
    }
  }
}' &
`,

  optsKeyHandler: `
# opts key handler
key | run '({ read, _: {msg} }, { stage: { opts } }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !opts.enabled) continue;
    switch (msg.key) {
      case "1": opts.wallOpacity = 0; break;
      case "2": opts.wallOpacity = 1; break;
      case "3": opts.wallOpacity = 0.4; break;
      // case "l": opts.lights = !opts.lights; break;
    }
  }
}' &
`,
};

export const profiles = {
  first: `
await-stage "\${STAGE_KEY}"

${shellScripts.selectionKeyHandler.trim()}

${shellScripts.lockedSelectionKeyHandler.trim()}

${shellScripts.optsKeyHandler.trim()}

`.trim(),
};
