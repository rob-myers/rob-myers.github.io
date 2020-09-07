We're creating an `Online Collaborative Game AI Engine`.

- environment: three.js
- geometry: blender, react-three-fiber, gltfjsx
- director: mvdan-sh, xterm.js, rxjs

---

Reading arbitrary variables

If `p` is a stored variable then `p` will output it to stdout.
Similarly for `point.x`.
For `echo $( point.x )` we'll need to intercept and stringify `point.x`.
We also permit `echo $point` but `echo ${point.x}` won't parse.

---

`click` -- await a single floor/actor/item/obstacle click and store it
`read` -- read from stdin and store it
`spawn` -- create an actor at specified position

`click p` awaits a click and stores as `p`
`click --block p` block other clicks

```sh
# e.g. movePair a b
movePair () {
  local p q
  click p q 
  actor $1 goto p
  actor $2 goto q
}
```

---

A language for games

- actor
- item
- trigger (rect, circle)
