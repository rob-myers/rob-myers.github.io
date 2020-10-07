This folder contains `*.blend` files and also exports `*.gltf`.

An npm script watches this directory.

Typically the script detects changed gltf's, and:

- copies the new/changed gltf to e.g. `public/rooms.gltf`
- create a new jsx file e.g.  `components/3d/gltf/rooms.gltf.jsx`
