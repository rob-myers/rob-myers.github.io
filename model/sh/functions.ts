export const preloadedFunctions = {
  range: `
{
  call '(_, x) => [...Array(Number(x))].map((_, i) => i)' "$1"
}`,
  seq: `
{
  range "$1" | split
}`,
  filter: `
{
  map -x "fn = $1; return (...args) => fn(...args) ? args[0] : undefined"
}`,
  /** We don't support backticks in the argument */
  jarg: `
{
  call '() => {
    try { return Function("_", \`return '\${1:-\\"\\"}'\` )(); }
    catch { return JSON.stringify(\`'$1'\`); }
  }'
}
`,
  reduce: `
{
  sponge | {
    test '/\\S/' "$2" \\
      && map "x => x.reduce($1, $( jarg "$2" ) )" \\
      || map "x => x.reduce($1)"
  }
}  
`,
  pretty: `
map '(x, { compactSafeStringify }) => compactSafeStringify(x)'
`,
};

export const preloadedVariables = {
  placeholder: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`,
};
