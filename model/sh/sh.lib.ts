export const preloadedFunctions = {

  /** Evaluate and return a javascript expression */
  expr: `run '({ api, args }) {
  const input = args.join(" ")
  yield api.parseJsArg(input)
}' "$@"`,

  /** Execute a javascript function */
  call: `run '({ args, api }) {
  const func = Function(\`return \${args[0]}\`)()
  yield await func(api.provideCtxt(args.slice(1)))
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
          resolve({ x: e.point.x, y: e.point.y })
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
      api.throwError("format: \`spawn {key} [{vecJson}]\` e.g. spawn andros \'{"x":300,"y":120}\'")
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
      api.throwError("format: \`nav {key} [{vecJson}]\` e.g. nav andros \'{"x":300,"y":120}\'")
    }

    const wire = api.getWire()
    const sub = wire.subscribe((e) => {
      if (e.key === "nav-res") {
        console.log({ e });
        sub.unsubscribe();
      }
    });
    wire.next({ key: "nav-req", npcKey })

  }' "$@"
}`
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
