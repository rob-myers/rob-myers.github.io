## Some slow exmaples

```sh
# 0.7s
time ( seq 1000 | while read x; do :; done )
# 6.3s
time ( seq 10000 | while read x; do :; done )
# 0.7s
for (( i = 0; i <= 1000; i++ )); do :; done
# 1s
time for (( i = 0; i <= 1000; i++ )); do (( sum += i )); done
# 8.8s
time for (( i = 0; i <= 10000; i++ )); do (( sum += i )); done
# 1s
time ( seq 1000 | { while read i; do (( sum += i )); done; echo ${sum}; } )
# 0.3s
time seq 1000000 >foo
```

```sh
sum() {
  local i=${1} j
  while [[ ${i} -ge 0 ]]; do
    (( j += i, i-- ))
  done
  echo ${j}
}
# 1.7s
time sum 1000
```

```sh
sum() {
  [[ ${1} -eq 0 ]] && { echo 0; return; }
  echo $(( ${1} + $( sum $(( ${1} - 1 )) ) ))
}
# 1s
time sum 100
# Never terminates
time sum 1000
```

## Fast examples via new binary 'expr' (js eval wrapper)

```sh
# 0.03s
time ( echo $( seq 10000 ) | expr -v '([x]) => eval(x.split(" ").join("+"))' )
# 0.16s
time ( echo $( seq 100000 ) | expr -v '([x]) => eval(x.split(" ").join("+"))' )
# 0.03s
time ( seq 10000 | expr -v 'x => eval(x.join("+"))' )
# 0.22s
time ( seq 100000 | expr -v 'x => eval(x.join("+"))' )
# 0.15s
time ( echo $( seq 100000 ) | expr -v '([x]) => eval(x.replace(new RegExp(" ", "g"), "+"))' )
# 0.17s
time ( seq 100000 | expr -vi 'x => x.reduce((sum, i) => sum + i, 0)' )
```
