export const preloadedFunctions = {
  range: `call '(_, x) => [...Array(Number(x))].map((_, i) => i)' "$1"`,
  seq: `range "$1" | split`,
  filter: `map -x "fn = $1; return (...args) => fn(...args) ? args[0] : undefined"`,
  /** Backticks must be escaped */
  jarg: `call "() => {
    try { return Function('_', \\\`return \${1:-}\\\` )(); }
    catch { return \\\`$1\\\`; }
}"
`,
  reduce: `sponge | {
  test '/\\S/' "$2" \\
    && map "x => x.reduce($1, $( jarg "$2" ) )" \\
    || map "x => x.reduce($1)"
}
`,
  pretty: `map '(x, { use: {stringify} }) => stringify(x)'`,
  keys: `map Object.keys`,
  cat: `get "$@" | split`,
 
  light: `echo foo`,  
  /**
   * TODO redo
   */
  sel: `run '({ read }, { stage: {sel}, use: {Geom} }) {
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

  selectionKeyHandler: `
# selection key handler
key | run '({ read, _: {msg} }, { stage: { opts, sel, poly }, use: {THREE, Geom, geom} }) {
  while (msg = await read()) {
    if (msg.type === "keyup" || !opts.enabled || !sel.enabled) continue;

    switch (msg.key) {
      case "-":
      case "+":
        if (!sel.locked) {
          const delta = msg.key === "-" ? 0.1 : -0.1;
          sel.localBounds = sel.localBounds.clone().inset(delta);
        }
        break;
      case "Backspace":
        if (sel.locked) {
          poly.wall = geom.cutOut(sel.wall, poly.wall);
          poly.obs = geom.cutOut(sel.obs, poly.obs);
        } else {
          const delta = Geom.Polygon.from(sel.bounds);
          poly.wall = geom.cutOut([delta], poly.wall);
          poly.obs = geom.cutOut([delta], poly.obs);
        }
        break;
      case "w":
      case "s":
        if (!sel.locked && !msg.metaKey) {
          const delta = Geom.Polygon.from(sel.bounds);
          if (msg.key === "w") {
            poly.wall = geom.union(poly.wall.concat(delta));
            poly.obs = geom.cutOut([delta], poly.obs);
          } else {
            poly.obs = geom.union(poly.obs.concat(delta));
            poly.wall = geom.cutOut([delta], poly.wall);
          }
        }
        break;
      case "Escape":
        sel.locked = false;
        sel.localWall = [];
        sel.localBounds = new Geom.Rect(0, 0, 0, 0);
        break;
      case "c":
      case "x":
        if (msg.metaKey && !sel.locked) {
          const deltaWalls = geom.intersectPolysRect(poly.wall, sel.bounds);
          const deltaObs = geom.intersectPolysRect(poly.obs, sel.bounds);
          [sel.wall, sel.obs, sel.locked] = [deltaWalls, deltaObs, true];
          if (msg.key === "x") {
            poly.wall = geom.cutOut(deltaWalls, poly.wall);
            poly.obs = geom.cutOut(deltaObs, poly.obs);
          }
        } else if (!msg.metaKey && sel.locked) {
          const matrix = (new THREE.Matrix4).makeScale(1, -1, 1)
            .setPosition(0, 2 * sel.localBounds.cy, 0);
          sel.group.matrix.multiply(matrix);
        }
        break;
      case "y":
        if (sel.locked && !msg.metaKey) {
          const matrix = (new THREE.Matrix4).makeScale(-1, 1, 1)
            .setPosition(2 * sel.localBounds.cx, 0, 0);
          sel.group.matrix.multiply(matrix);
        }
        break;
      case "q":
      case "Q":
        if (sel.locked && !msg.metaKey) {
          const { cx, cy } = sel.bounds;
          const angle = (msg.key === "Q" ? -1 : 1) * (Math.PI / 2);
          sel.group.matrix.premultiply(
            (new THREE.Matrix4).makeTranslation(-cx, -cy, 0)
            .premultiply((new THREE.Matrix4).makeRotationZ(angle))
            .premultiply((new THREE.Matrix4).makeTranslation(cx, cy, 0))
          );
        }
        break;
      case "v":
        if (sel.locked && msg.metaKey) {
          poly.wall = geom.union(poly.wall.concat(sel.wall));
          poly.obs = geom.union(poly.obs.concat(sel.obs));
        }
        break;
      case "z":
        if (msg.metaKey) {
          poly.wall = poly.prevWall;
          poly.obs = poly.prevObs;
        }
        break;
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

${shellScripts.optsKeyHandler.trim()}

`.trim(),
};
