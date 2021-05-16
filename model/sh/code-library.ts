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
  pretty: `map '(x, {use}) => use.stringify(x)'`,
  keys: `map Object.keys`,
  // cat: `get "$@" | split`,

  // 'map console.log' would log the 2nd arg too
  log: `map 'x => console.log(x)'`,
};

export const preloadedVariables = {
};

export const shellScripts = {

  optsKeyHandler: `
# options key handler
key | run '({ read, _: {msg} }, { stage: { opt } }) {
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
