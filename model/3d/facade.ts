/**
 * We use this facade to prevent three.js from breaking server-side rendering.
 */
import type { SkeletonUtils as SkeletonUtilsNamespace } from 'three/examples/jsm/utils/SkeletonUtils';
export let SkeletonUtils: typeof SkeletonUtilsNamespace;

import type { Geometry as GeometryClass, Face3 as Face3Class } from 'three/examples/jsm/deprecated/Geometry';
export let Geometry: typeof GeometryClass;
export let Face3: typeof Face3Class;

import { getWindow } from 'model/dom.model';

if (getWindow()) {
  import('three/examples/jsm/utils/SkeletonUtils').then((x) => {
    SkeletonUtils = x.SkeletonUtils;
  });
  import('three/examples/jsm/deprecated/Geometry').then((x) => {
    Geometry = x.Geometry;
    Face3 = x.Face3;
  });
}
