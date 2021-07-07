export const preloadedFunctions = {

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

export const preloadedVariables = {
};

export const shellScripts = {

  /**
   * TODO `key` and `stage` no longer exist
   */
  optsKeyHandler: `

# options key handler
key | run '({ api: {read}, var: {msg}, stage: {opt} }) {
  while (msg = await read()) {
    if (msg.type !== "keydown" || !opt.enabled) continue;
    switch (msg.key) {
      // NOOP
    }
  }
}' &
`,
};

export const profiles = {
  first: `

${shellScripts.optsKeyHandler.trim()}

`.trim(),
};
