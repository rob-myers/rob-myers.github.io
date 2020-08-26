#!/bin/bash

# default is "modified 5s ago or less"
mtime=${1:-"-5s"}

# expect folder '3d' to be a sibling of repo root
cd public
changedFiles=$( find '../../3d' -name '*.gltf' -mtime $mtime )
 
for src in $changedFiles; do
  echo "detected changed file: $src relative to $( pwd )"

  gltfFilename="$( basename $src )"
  cp "$src" "$gltfFilename"

  jsxFilename="${gltfFilename%%.*}.gltf.jsx"
  node ../../gltfjsx/index.js \
    --compress false \
    --extras true \
    --precision 4 \
    "$gltfFilename" "../components/3d/gltf/$jsxFilename"
done
