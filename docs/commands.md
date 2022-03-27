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
