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
  filter: `run '({ api, args, datum }) {
  const func = Function(\`return \${args[0]}\`)()
  while ((datum = await api.read()) !== null)
    if (func(datum)) yield datum
}' "$@"`,

  /** Apply function to each item from stdin */
  map: `run '({ api, args, datum }) {
  const func = Function(\`return \${args[0]}\`)()
  while ((datum = await api.read()) !== null)
    yield func(datum)
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
   * Split strings by optional separator (default `' '`).
   * Otherwise ignore.
   */
  split: `run '({ api, args }) {
    const arg = args[0] || " "
    while ((datum = await api.read()) !== null) {
      if (datum instanceof Array) {
        yield* datum
      } else if (typeof datum === "string") {
        yield* datum.split(arg)
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
  map '(x, {util}) => util.pretty(x)'
}`,

  keys: `{
  map Object.keys
}`,
  // cat: `get "$@" | split`,

  // 'map console.log' would log the 2nd arg too
  log: `{
  map 'x => console.log(x)'
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
