export const preloadedFunctions = {

  range: `call '({args}) => [...Array(Number(args[0]))].map((_, i) => i)' "$1"`,

  seq: `range "$1" | split`,

  pretty: `map '(x, {lib}) => lib.stringify(x)'`,

  keys: `map Object.keys`,
  // cat: `get "$@" | split`,

  // 'map console.log' would log the 2nd arg too
  log: `map 'x => console.log(x)'`,
};

export const preloadedVariables = {
  _: {},
};

export const shellScripts = {

  optsKeyHandler: `
# options key handler
key | run '({ api: {read}, var: {_: {msg}}, stage: {opt} }) {
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
ready "\${STAGE_KEY}"

${shellScripts.optsKeyHandler.trim()}

`.trim(),
};
