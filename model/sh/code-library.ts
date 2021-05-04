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
  cat: `get "$@" | split`,

  cursor: `get stage.cursor`,
 
  light: `{
# create light at cursor
call '({ stage, use: {geom} }) => {
  const position = stage.cursor.clone().setZ(2);
  const light = geom.createSpotLight(position);
  stage.light.add(light);
}'
}`,

  bot: `{
# create bot at cursor
call '({ stage, use: {Util} }) => {
  const position = stage.cursor.clone();
  const { group, clips } = Util.createBot();
  group.position.copy(position);
  stage.bot.add(group, clips);
  // const mixer = new THREE.AnimationMixer(group);
  // mixer.clipAction(clips[0]).play();
}'
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
      case "+":
        if (!sel.locked) {
          const delta = msg.key === "-" ? 0.1 : -0.1;
          sel.localBounds = sel.localBounds.clone().inset(delta);
        }
        break;
      case "Backspace": {
        const delta = Geom.Polygon.from(sel.bounds);
        poly.update({ prevWall: poly.wall, prevObs: poly.obs,
          wall: geom.cutOut([delta], poly.wall),
          obs: geom.cutOut([delta], poly.obs),
        });
        break;
      }
      case "w":
      case "s":
        if (!sel.locked && !msg.metaKey) {
          const delta = Geom.Polygon.from(sel.bounds);
          if (msg.key === "w") {
            const nextObs = geom.cutOut([delta], poly.obs);
            poly.update({ prevWall: poly.wall, prevObs: nextObs,
              wall: geom.union(poly.wall.concat(delta)),
              obs: nextObs,
            });
          } else {
            const nextWall = geom.cutOut([delta], poly.wall);
            poly.update({ prevWall: nextWall, prevObs: poly.obs,
              obs: geom.union(poly.obs.concat(delta)),
              wall: nextWall,
            });
          }
        }
        break;
      case "Escape":
        sel.locked = false;
        sel.localBounds = new Geom.Rect(0, 0, 0, 0);
        [sel.localWall, sel.localObs] = [[], []];
        break;
      case "c":
        if (msg.metaKey) {
          const deltaWalls = geom.intersectPolysRect(poly.wall, sel.bounds);
          const deltaObs = geom.intersectPolysRect(poly.obs, sel.bounds);
          [sel.wall, sel.obs, sel.locked] = [deltaWalls, deltaObs, true];
        }
        break;
      case "x":
        if (msg.metaKey && !sel.locked) {
          const deltaWalls = geom.intersectPolysRect(poly.wall, sel.bounds);
          const deltaObs = geom.intersectPolysRect(poly.obs, sel.bounds);
          [sel.wall, sel.obs, sel.locked] = [deltaWalls, deltaObs, true];
          poly.update({ prevWall: poly.wall, prevObs: poly.obs,
            wall: geom.cutOut(deltaWalls, poly.wall),
            obs: geom.cutOut(deltaObs, poly.obs),
          });
        } else if (msg.metaKey && sel.locked) {
          poly.update({ prevWall: poly.wall, prevObs: poly.obs,
            wall: geom.cutOut(sel.wall, poly.wall),
            obs: geom.cutOut(sel.obs, poly.obs),
          });
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
          poly.update({ prevWall: poly.wall, prevObs: poly.obs,
            wall: geom.union(poly.wall.concat(sel.wall)),
            obs: geom.union(poly.obs.concat(sel.obs)),
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
      case "2": opt.wallOpacity = 1; break;
      case "3": opt.wallOpacity = 0.4; break;
      // case "l": opt.lights = !opt.lights; break;
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
