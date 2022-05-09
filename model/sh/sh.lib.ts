export const preloadedFunctions = {

  /** Evaluate and return a javascript expression */
  expr: `run '({ api, args }) {
  const input = args.join(" ")
  yield api.parseJsArg(input)
}' "$@"`,

  /** Execute a javascript function */
  call: `run '(ctxt) {
  const func = Function(\`return \${ctxt.args[0]}\`)()
  ctxt.args = ctxt.args.slice(1)
  yield await func(ctxt)
}' "$@"`,

  /** Filter inputs */
  filter: `run '(ctxt) {
  let { api, args, datum } = ctxt
  const func = Function(\`return \${args[0]}\`)()
  while ((datum = await api.read()) !== null)
    if (func(datum, ctxt)) yield datum
}' "$@"`,

  /** Apply function to each item from stdin */
  map: `run '(ctxt) {
  let { api, args, datum } = ctxt
  const func = Function(\`return \${args[0]}\`)()
  while ((datum = await api.read(true)) !== null) {
    if (datum.__chunk__) yield { ...datum, items: datum.items.map(x => func(x, ctxt)) }
    else yield func(datum, ctxt)
  }
}' "$@"`,

  poll: `run '({ api, args }) {
  yield* api.poll(args)
}' "$@"`,

  /** Reduce all items from stdin */
  reduce: `run '({ api, args }) {
    const inputs = []
    const reducer = Function(\`return \${args[0]}\`)()
    while ((datum = await api.read()) !== null)
      inputs.push(datum)
    yield args[1]
      ? inputs.reduce(reducer, api.parseJsArg(args[1]))
      : inputs.reduce(reducer)
  }' "$@"`,

  /**
   * Split arrays from stdin into items.
   * Split strings by optional separator (default `''`).
   * Otherwise ignore.
   */
  split: `run '({ api, args }) {
    const arg = args[0] || ""
    while ((datum = await api.read()) !== null) {
      if (datum instanceof Array) {
        // yield* datum
        yield { __chunk__: true, items: datum };
      } else if (typeof datum === "string") {
        // yield* datum.split(arg)
        yield { __chunk__: true, items: datum.split(arg) };
      }
    }
  }' "$@"`,

  /** Collect stdin into a single array */
  sponge: `run '({ api }) {
    const outputs = []
    while ((datum = await api.read()) !== null)
      outputs.push(datum)
    yield outputs
  }'`,

  range: `{
call '({args}) =>
  [...Array(Number(args[0]))].map((_, i) => i)
' "$1"
}`,

  seq: `{
  range "$1" | split
}`,

  pretty: `{
  map '(x, { api }) => api.pretty(x)'
}`,

  keys: `{
  map Object.keys
}`,
  // cat: `get "$@" | split`,

  // 'map console.log' would log the 2nd arg too
  log: `{
  map 'x => console.log(x)'
}`,

  /**
   * Output world position clicks sent via WIRE_KEY.
   * e.g. `click`, `click 1`
   */
  click: `{
  run '({ api, args, home }) {
    const numClicks = args[0] === "" ? Number.MAX_SAFE_INTEGER : Number(args[0])
    if (!Number.isFinite(numClicks)) {
      api.throwError("format: \`click [numberOfClicks]\`")
    }
    const wire = api.getWire()

    const process = api.getProcess()
    let [resolve, reject] = [(_) => {}, (_) => {}]

    const sub = wire.subscribe({
      next: (e) => {// ProcessStatus.Running === 1
        if (e.key === "pointerup" && process.status === 1) {
          resolve({ x: Number(e.point.x.toFixed(2)), y: Number(e.point.y.toFixed(2)) })
        }
      },
    });
    process.cleanups.push(
      () => sub.unsubscribe(),
      () => reject(api.getKillError()),
    )

    for (let i = 0; i < numClicks; i++) {
      yield await new Promise((res, rej) => [resolve, reject] = [res, rej])
    }
    sub.unsubscribe()

  }' "$@"
}`,

  /**
   * Spawn a character at a position.
   * e.g. `spawn andros "$( click 1 )"`
   */
  spawn: `{
  run '({ api, args, home }) {
    const npcKey = args[0]
    const position = api.safeJsonParse(args[1])
    if (
      !npcKey
      || position === undefined
      || position && !(typeof position.x === "number" && typeof position.y === "number")
    ) {
      api.throwError("format: \`spawn {key} [{vec}]\` e.g. spawn andros \'{"x":300,"y":120}\'")
    }

    // TODO better default position?
    const at = position || { x: 0, y: 0 }
    const wire = api.getWire()
    wire.next({ key: "spawn", npcKey, at })
  }' "$@"
}`,

  /**
   * Request navpath to position for character via WIRE_KEY.
   * e.g. `nav andros "$( click 1 )"'
   */
  nav: `{
  run '({ api, args }) {
    const npcKey = args[0]
    const position = api.safeJsonParse(args[1])
    if (
      !npcKey
      || position === undefined
      || position && !(typeof position.x === "number" && typeof position.y === "number")
    ) {
      api.throwError("format: \`nav {npc-key} [{vec}]\` e.g. nav andros \'{"x":300,"y":120}\'")
    }

    const wire = api.getWire()
    const res = await new Promise(resolve => {
      const navReq = { key: "nav-req", npcKey, dst: position }
      const sub = wire.subscribe((e) => {
        if (e.key === "nav-res" && e.req === navReq) {
          sub.unsubscribe()
          resolve(e.res)
        }
      });
      wire.next(navReq)
    })
    yield res

    // TEST DEBUG
    const path = (res?.paths??[]).reduce((agg, item) => agg.concat(item), []);
    wire.next({ key: "debug-path", pathName: "test-" + npcKey, path })
  }' "$@"
}`,

  /**
   * Move an npc along a path via WIRE_KEY.
   * e.g. `walk andros "[$( click 1 ), $( click 1 )]"'
   */
  walk: `{
  run '({ api, args }) {
    const npcKey = args[0]
    const path = api.safeJsonParse(args[1]) || !api.isTtyAt(0) && await api.read()
    if (
      !npcKey
      || !Array.isArray(path)
      || !path.every(p => p && typeof p.x === "number" && typeof p.y === "number")
    ) {
      api.throwError("format: \`walk {npc-key} [{vec},...,{vec}]\` e.g.\\n\\r- walk andros \\"[$( click 1 ), $( click 1 )]\\"\\n\\r- myPath | walk andros")
    }

    // TODO wait for response, and provide NPC api?
    const wire = api.getWire()
    wire.next({ key: "move-req", npcKey, path })
    // console.log({ path })
  }' "$@"    
}`,

  // TODO currently a simplification
  go: `{
  nav $1 $(click 1) |
    map 'x => x.paths.reduce((agg, item) => agg.concat(item), [])' |
    walk $1
}`,

  // TODO validation
  view: `{
  run '({ api, args }) {
    const zoom = Number(args[0])
    const at = api.safeJsonParse(args[1])
    // TODO validation
    const wire = api.getWire()
    wire.next({ key: "view", zoom, at })
  }' "$@"
}`,
};

export const preloadedVariables = {};

export const shellScripts = {

  unusedBackgroundHandler: `
foo | bar | baz &
`,
};

export const profiles = {
  unused: `

${shellScripts.unusedBackgroundHandler.trim()}

`.trim(),
};
