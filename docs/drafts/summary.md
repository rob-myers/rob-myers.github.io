We're creating an `Online Collaborative Game AI Engine`.

- environment: three.js
- geometry: blender, react-three-fiber, gltfjsx
- director: mvdan-sh, xterm.js, rxjs

---

Reading arbitrary variables

If `p` is a stored variable then `get p` will output it to stdout.
Similarly for `get point.x`.
For `echo $( get point.x )` we'll need to intercept and stringify `point.x`.

---

`click` -- await a single floor/actor/item/obstacle click and store it
`read` -- read from stdin and store it
`spawn` -- create an actor at specified position
`click p` awaits a click and stores as `p`

---

A language for games

- actor
- item
- trigger (rect, circle)
