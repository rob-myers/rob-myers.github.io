## UI Pipelines

```sh
key |
  map "${brush_keys_filter}" |
  run '({ read, _: {key} }, { stage: {brush} }) {
    while (key = await read()) {
      if (/[3-9]/.test(key)) {
        brush.sides = Number(key);
      } else if (key === "s") {
        brush.shape = ["rect", "poly"].find(x => x !== brush.shape);
      } else if (key === "a") {
        brush.paint();
      } else if (key === "d") {
        brush.erase();
      }
    }
  }' &
```

## Library

```sh
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
  call '() => {
    try { return Function("_", \`return '\${1:-\\"\\"}'\` )(); }
    catch { return JSON.stringify(\`'$1'\`); }
  }'
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

## Variables

```sh
brush_keys_fn='({ event, key }) =>
  event === "keydown" && /^[s3-9]$/.test(key) ? key : undefined'
```

## Hodgepodge


```sh
run '({ read, sleep }) {
  yield "foo"
  await sleep(5)
  yield "bar"
}'
```

```sh
echo '{
  one
  two
}'
```

```sh
seq 10 | map 'x => [x * 2, 0, 1, 1]' | wall
```
