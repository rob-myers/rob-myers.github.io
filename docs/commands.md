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

```sh
$ seq 10 | sponge
[0,1,2,3,4,5,6,7,8,9]

$ seq 10 | reduce '(agg, item) => agg + item'
45

$ filter 'x => x.length > 2'
ab  # user input sans prompt
abc # user input sans prompt
abc # response
```

```sh
$ poll 1 | map 'x => 2 ** x'
2
4
8 # ...
^C

$ poll 5 | map 'x => 2 ** x' &
2
4
$ ps -a
pid   ppid  pgid 
0     0     0    ▶️  ps -a
1     0     1    ▶️  poll 5 | map 'x => 2 ** x' &
2     1     1    ▶️  poll 5
3     1     1    ▶️  map 'x => 2 ** x'
4     2     1    ▶️  run '({ api, args }) { ...
5     3     1    ▶️  run '(ctxt) { ...
16
64
$ kill 1
$ ps -a
pid   ppid  pgid 
0     0     0    ▶️  ps -a
```