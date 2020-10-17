```sh
spawn $(click) bob
@bob go $(click)
```

```sh
spawn $(click) bob
@bob speed 0.04
while click p; do
  @bob go p &
done
```

```sh
spawn $(click) bob
spawn $(click) alice
@alice look bob
```
