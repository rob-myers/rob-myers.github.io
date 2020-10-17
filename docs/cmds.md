```sh
spawn $(click) bob
@bob go $(click)
@bob go $(@camera at)
```

```sh
spawn $(click) bob
@bob speed 0.04
@bob
while click p; do
  @bob go p &
done
```

```sh
spawn $(click) bob
spawn $(click) alice
@alice look bob
@alice
@alice goto $(click)
@camera
```

```sh
def match '(v) => RegExp(v["1"]).test(v["2"])'
match '^a+' aaa
```