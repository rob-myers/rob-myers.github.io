## UI Pipelines

```sh
key | run '({ read, _: {msg} }, { stage: s }) {
  while (msg = await read()) {
    if (msg.type !== "keydown") continue;
    switch (msg.key) {
      case "f": s.brush.paint(); break;
      case "v": msg.metaKey && s.brush.paint(); break;
      case "F": s.brush.erase(); break;
      case "Backspace": s.brush.erase(); break;
      case "c": msg.metaKey && s.brush.select(); break;
      case "x": msg.metaKey && s.brush.cutSelect();
        !msg.metaKey && s.brush.transform("mirror(x)"); break;
      case "Escape": s.brush.deselect(); break;
      case "y": s.brush.transform("mirror(y)"); break;
      case "q": s.brush.transform("rotate(90)"); break;
      case "Q": s.brush.transform("rotate(-90)"); break;
      case "z": msg.metaKey && s.brush.undoRedo(); break;
    }
  }
}' &
```

```sh
key | run '({ read, _: {msg} }, { stage: { opts } }) {
  while (msg = await read()) {
    if (msg.type !== "keydown") continue;
    switch (msg.key) {
      case "1": [opts.wallHeight, opts.wallOpacity] = [0, 0.2]; break;
      case "2": [opts.wallHeight, opts.wallOpacity] = [2, 1]; break;
      case "3": [opts.wallHeight, opts.wallOpacity] = [2, 0.2]; break;
      case "l": opts.lights = !opts.lights; break;
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
