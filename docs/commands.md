# Command Examples

```sh
$ cd /
# Get all queryKeys
$ cache/queries | split | map 'x => x.queryKey'
# or
$ cache/queries | map 'xs => xs.map(x => x.queryKey)'

# Get keys of data of first cached item
$ cache/queries/0/state/data | keys
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

```sh
spawn foo "$( click 1 )"
# then click where to spawn "foo" (or Ctrl-C to cancel)
nav foo "$( click 1 )"
# then click where to navigate "foo" (or Ctrl-C to cancel)
{"paths":[[{"x":185.7,"y":394.86},{"x":209,"y":369.6},{"x":209,"y":349.6},{"x":220,"y":346},{"x":254,"y":346},{"x":299,"y":590}],[{"x":300,"y":610},{"x":303.39,"y":791.45}]],"edges":[{"src":{"gmId":0,"hullDoorId":2,"exit":{"x":299,"y":590}},"dst":{"gmId":1,"hullDoorId":5,"entry":{"x":300,"y":610}}}]}

# Get path through 1st geomorph
nav foo "$( click 1 )" | map 'x => x.paths[0]'
# Get path through all geomorphs (ignoring if doors closed)
nav foo "$( click 1 )" | map 'x => x.paths.reduce((agg, path) => agg.concat(path), [])'

# save a global path
nav foo "$( click 1 )" | map 'x => x.paths.reduce((agg, path) => agg.concat(path), [])' >myPath
myPath
[{"x":185.7,"y":394.86},{"x":209,"y":369.6},{"x":209,"y":349.6},{"x":297.61,"y":283.22}]
# move along it
walk foo "$myPath"
# reverse it, and move back
myPath | map 'x => x.reverse()'
walk foo "$myPath"
```

```sh
cd
spawn foo $( click 1 )
nav foo $( click 1 )
_
{"paths":[[{"x":89.07,"y": ...
_/paths/0
[{"x":89.07,"y":311.26},{"x":254,"y":346},{"x":299,"y":590}]
_
[{"x":89.07,"y":311.26},{"x":254,"y":346},{"x":299,"y":590}]
walk foo $_
_ | map 'x => x.reverse()'
walk foo $( _ )
```

```sh
spawn andros $( click 1 )
nav andros $( click 1 ) | map 'x => x.paths[0]' >myPath
walk andros ${myPath}
myPath | map 'x => x.reverse()'
walk andros ${myPath}
# finished
```
