```sh
spawn bob $(click)
@bob watch &
@bob
while click p; do
  @bob go p &
done
```

```sh
spawn bob $(click)
@bob go $(click)
@bob go $(@camera at)
```

```sh
spawn bob $(click)
@bob speed 0.04
@bob
while click p; do
  @bob go p &
done
```

```sh
spawn bob $(click)
spawn alice $(click)
@alice look bob
@alice
@alice goto $(click)
@camera
```

```sh
def match '(v) => RegExp(v["1"]).test(v["2"])'
match '^a+' aaa
```