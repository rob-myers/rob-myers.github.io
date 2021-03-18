```sh

# TODO better approach to `set`
# e.g. auto-update, support cycling between choices

brush_keys_fn='({ event, key }) => event === "keydown" && /^[s3-9]$/.test(key) ? key : undefined'

key | map "${brush_keys_fn}" |
  while read brush_key; do
    test /[3-9]/ ${brush_key} && set /brush/sides "${sides}"
    test /s/ ${brush_key} && set /brush/shape {poly,rect}
  done &

# `range 5` outputs array `[0,..,4]`
range () {
  call '(_, x) => [...Array(Number(x))].map((_, i) => i)' "$1"
}

# `seq 5` outputs 5 lines `1`..`5`
seq () {
  range "$1" | split
}

# can `echo {1..10} | split ' ' | filter 'x => Number(x) < 5'`
filter () {
  map -x "fn = $1; return (...args) => fn(...args) ? args[0] : undefined"
}

# Interpret text as JS, falling back to string
jarg () {
  call "() => {
    try { return Function('_', \\\`return \${1:-\\"\\"}\\\` )(); }
    catch { return JSON.stringify(\\\`$1\\\`); }
  }"
}

# reduce over all inputs
reduce () {
  sponge | {
    test '/\\S/' "$2" \
      && map "x => x.reduce($1, $( jarg \"$2\" ) )" \
      || map "x => x.reduce($1)"
  }
}

# can `call '_ => [[1],[2,3]]' | flatten`
flatten () {
  map 'x => Array.isArray(x) ? x.flatMap(y => y) : x'
}

```
