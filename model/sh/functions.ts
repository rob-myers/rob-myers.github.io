import { getWindow } from "model/dom.model";

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

const navigator = getWindow()?.navigator;

export const preloadedVariables = {
  navigator: {
    platform: navigator?.platform??'',
    userAgent: navigator?.userAgent??'',
  },
};
