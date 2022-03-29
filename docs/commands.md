# Command Examples

```sh
$ cd /
# Get queryKey of first cached item
$ cache/queries/0/cache/queries/0/queryKey
/geomorph/g-301--bridge.json

# Get all queryKeys
$ cache/queries/0/cache/queries | map '([x]) => x.queryKey'
/geomorph/g-301--bridge.json

# Get keys of data of first cached item
$ cache/queries/0/cache/queries/0/state/data | keys
["key","id","def","groups","holes","doors","labels","navPoly","navDecomp","roomGraph","hullPoly","hullRect","hullTop","items","d"]
```

```sh
$ call '() => ({ x: 2, y: -9 })'
{ x: 2, y: -9 } # gold because not a string

$ call '() => ({ x: 2, y: -9 })' >bar
$ bar
{ x: 2, y: -9 }
$ bar/x
2
```

```sh
$ echo 'one of a pair' | map 'x => [x, x]'
["one of a pair","one of a pair"]
$ map 'x => [x, x]'
42
["42","42"]
^C # Ctrl-C
$ map 'x => [x, x].map(Number)'
42
[42,42]
```
