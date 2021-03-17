```sh
# Change brush sides on press numeric keys
key |
  map '({ event, key }) => event === "keydown" && /^[3-9]$/.test(key) ? Number(key) : undefined' |
  while read sides; do
    set /brush/sides ${sides}
  done &
```
