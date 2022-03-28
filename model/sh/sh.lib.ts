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
  while ((datum = await api.read()) !== null)
    yield func(datum, ctxt)
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
   * Receive world position clicks from STAGE_KEY to stdin.
   */
  click: `{
run '({ api, args, home }) {
  const numClicks = args[0] === ""
    ? Number.MAX_SAFE_INTEGER : Number(args[0]);
  if (!Number.isFinite(numClicks)) {
    api.throwError("format: click [numberOfClicks]");
  }
  const stageKey = home.STAGE_KEY
  if (typeof stageKey !== "string") {
    api.throwError("STAGE_KEY: expected string value");
  }
  const stage = api.getCached(stageKey);
  if (!stage) {
    api.throwError(\`stage not found for STAGE_KEY "\${stageKey}"\`);
  }

  const process = api.getProcess();
  let [resolve, reject] = [(_) => {}, (_) => {}];

  const sub = stage.ptrEvent.subscribe({
    next: (e) => {
      // ProcessStatus.Running === 1
      if (e.key === "pointerup" && process.status === 1) {
        resolve({ x: e.point.x, y: e.point.y });
      }
    },
  });
  process.cleanups.push(() => sub.unsubscribe(), () => reject(api.getKillError()));

  for (let i = 0; i < numClicks; i++) {
    yield await new Promise((res, rej) => [resolve, reject] = [res, rej]);
  }
  sub.unsubscribe();

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
