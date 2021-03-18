```sh

# TODO better approach to `set` e.g. auto-update, support cycling between choices
# TODO implement `test ${text} ${regex}`

brush_keys_fn='({ event, key }) =>
  event === "keydown" && /^[s3-9]$/.test(key) ? key : undefined'

key | map "${brush_keys_fn}" |
  while read brush_key; do
    test ${brush_key} /[3-9]/ && set /brush/sides "${sides}"
    test ${brush_key} /s/ && set /brush/shape {poly,rect}
  done &

range () {
  call '(_, x) => [...Array(Number(x))].map((_, i) => i)' "$1"
}
```
