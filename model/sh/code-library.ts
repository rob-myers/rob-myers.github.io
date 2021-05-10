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
if test '/\\S/' "$2"; then
  map "x => x.reduce($1, $( jarg "$2" ) )"
else map "x => x.reduce($1)"; fi
}
`,
  pretty: `map '(x, { use: {Util} }) => Util.stringify(x)'`,
  keys: `map Object.keys`,
  // cat: `get "$@" | split`,

  cursor: `get /stage.cursor`,
  // origin: `call '() => ({ x:0, y:0 })'`,

  // 'map console.log' would log the 2nd arg too
  log: `map 'x => console.log(x)'`,
 
  light: `{
# create lights at points
run '({ read, _: {msg, count = 0} }, { stage, use: {geom} }) {
  while (msg = await read()) {
    const light = geom.createSpotLight(msg, 2);
    stage.light.add(light);
    count++;
  }
  if (!count) {
    const light = geom.createSpotLight(stage.cursor, 2);
    stage.light.add(light);
  }
}' "$1"
}`,

  bot: `{
# create bots at points
run '({ read, _: {msg, count = 0} }, { stage, use: {Util} }, name) {
  while (msg = await read()) {
    const { group, clips } = Util.createBot();
    group.position.copy(msg);
    const botName = name ? count ? name + count : name : undefined;
    stage.bot.add(group, clips, botName);
    count++;
  }
  if (!count) {
    const { group, clips } = Util.createBot();
    group.position.copy(stage.cursor);
    stage.bot.add(group, clips, name);
  }
}' "$1"
}`,

  path: `{
# create nav path
run '({ read, _: {msg, points = []} }, { stage }) => {
  while (msg = await read()) {
    points.push(msg);
    if (points.length % 2 === 0) {
      const [src, dst] = points.slice().reverse();
      const path = stage.path.request(src, dst);
      // TODO create graphics
    }
  }
}' "$1"
}`,

};

export const preloadedVariables = {
};

export const shellScripts = {

  selectionKeyHandler: `
# selection key handler
key | run '({ read, _: {msg} }, { stage: { opt, sel, poly }, use: {THREE, Geom, geom} }) {
  while (msg = await read()) {
    if (msg.type === "keyup" || !opt.enabled || !sel.enabled) continue;

    switch (msg.key) {
      case "-":
      case "=":
        if (!sel.locked) {
          const delta = msg.key === "-" ? 0.1 : -0.1;
          sel.localBounds = sel.localBounds.clone().inset(delta);
        }
        break;
      case "Backspace": {
        const delta = Geom.Polygon.from(sel.bounds);
        poly.update({ prevWall: poly.wall, prevObs: poly.obs,
          wall: geom.cutOut([delta], poly.wall, 1),
          obs: geom.cutOut([delta], poly.obs, 1),
        });
        break;
      }
      case "w":
      case "s":
        if (!sel.locked && !msg.metaKey) {
          const delta = Geom.Polygon.from(sel.bounds);
          if (msg.key === "w") {
            const nextObs = geom.cutOut([delta], poly.obs, 1);
            poly.update({ prevWall: poly.wall, prevObs: nextObs,
              wall: geom.union(poly.wall.concat(delta), 1),
              obs: nextObs,
            });
          } else {
            const nextWall = geom.cutOut([delta], poly.wall, 1);
            poly.update({ prevWall: nextWall, prevObs: poly.obs,
              obs: geom.union(poly.obs.concat(delta), 1),
              wall: nextWall,
            });
          }
        }
        break;
      case "Escape":
        sel.update({ locked: false, localWall: [], localObs: [],
          localBounds: new Geom.Rect(0, 0, 0, 0),
        });
        break;
      case "c":
        if (msg.metaKey) {
          const deltaWalls = geom.intersectPolysRect(poly.wall, sel.bounds);
          const deltaObs = geom.intersectPolysRect(poly.obs, sel.bounds);
          if (deltaWalls.length || deltaObs.length) {
            const matrix = sel.group.matrix.clone().invert();
            sel.update({ locked: true,
              localWall: deltaWalls.map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1)),
              localObs: deltaObs.map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1)),
            });
          }
        }
        break;
      case "x":
        if (msg.metaKey && !sel.locked) {
          const deltaWalls = geom.intersectPolysRect(poly.wall, sel.bounds);
          const deltaObs = geom.intersectPolysRect(poly.obs, sel.bounds);
          if (deltaWalls.length || deltaObs.length) {
            const matrix = sel.group.matrix.clone().invert();
            sel.update({ locked: true,
              localWall: deltaWalls.map(x =>
                geom.applyMatrixPoly(matrix, x.clone()).precision(1)),
              localObs: deltaObs.map(x =>
                geom.applyMatrixPoly(matrix, x.clone()).precision(1)),
            });
            poly.update({ prevWall: poly.wall, prevObs: poly.obs,
              wall: geom.cutOut(deltaWalls, poly.wall, 1),
              obs: geom.cutOut(deltaObs, poly.obs, 1),
            });
          }
        } else if (msg.metaKey && sel.locked) {
          poly.update({ prevWall: poly.wall, prevObs: poly.obs,
            wall: geom.cutOut(sel.wall, poly.wall, 1),
            obs: geom.cutOut(sel.obs, poly.obs, 1),
          });
        } else if (!msg.metaKey && sel.locked) {
          const matrix = (new THREE.Matrix4).makeScale(1, -1, 1)
            .setPosition(0, 2 * sel.bounds.cy, 0);
          sel.group.matrix.premultiply(matrix);
        }
        break;
      case "y":
        if (sel.locked && !msg.metaKey) {
          const matrix = (new THREE.Matrix4).makeScale(-1, 1, 1)
            .setPosition(2 * sel.bounds.cx, 0, 0);
          sel.group.matrix.premultiply(matrix);
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
          poly.update({ prevWall: poly.wall, prevObs: poly.obs,
            wall: geom.union(poly.wall.concat(sel.wall), 1),
            obs: geom.union(poly.obs.concat(sel.obs), 1),
          });
          poly.update();
        }
        break;
      case "z":
        if (msg.metaKey) {
          poly.update({ prevWall: poly.wall, prevObs: poly.obs,
            wall: poly.prevWall,
            obs: poly.prevObs,
          });
        }
        break;
    }
  }
}' &
`,

  optsKeyHandler: `
# options key handler
key | run '({ read, _: {msg} }, { stage: { opt } }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !opt.enabled) continue;
    switch (msg.key) {
      case "1": opt.wallOpacity = 0; break;
      case "2": opt.wallOpacity = 1; opt.wallHeight = 0.5; break;
      case "3": opt.wallOpacity = 1; opt.wallHeight = 4; break;
      case "l": opt.ambientLight = opt.ambientLight === 1 ? 0.35 : 1; break;
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
