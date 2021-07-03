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

  mockDevEnv: `{
	DAVE=$'\\e[1;34mDave\\e[0;37m'
	pauseTyping () { sleep 2; echo; sleep 0.5; }
  yellowText () echo $'\\e[93m'$1$'\\e[0;37m'

	echo "Hello \${DAVE}, I see you've changed file $( yellowText /home/src/foo.jsx )."
	pauseTyping

	echo "I have generated "$( yellowText /home/dist/foo.js )", \${DAVE}".
	pauseTyping

	echo "I better let the browser runtime know now, \${DAVE}."
	pauseTyping

	yellowText "PING PONG!"
	echo "I will now resume listening for source file changes, \${DAVE}..."

  unset DAVE pauseTyping yellowText
}`
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
