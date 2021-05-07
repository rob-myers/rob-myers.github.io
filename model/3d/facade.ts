/**
 * We use this facade to prevent three.js from breaking server-side rendering.
 * We could use dynamic import() but awaiting it can delay initial render.
 *
 * - Geometry.js was created via:
 *   `ln -s ../../node_modules/three/examples/jsm/deprecated/Geometry.js model/3d/Geometry.js`
 * - SkeletonUtils.js was created via:
 *   `ln -s ../../node_modules/three/examples/jsm/utils/SkeletonUtils.js model/3d/SkeletonUtils.js`
 */
import type { SkeletonUtils as SkeletonUtilsNamespace } from 'three/examples/jsm/utils/SkeletonUtils';
import { SkeletonUtils as SkeletonUtilsValue } from './SkeletonUtils';
export const SkeletonUtils = SkeletonUtilsValue as typeof SkeletonUtilsNamespace;

import type { Geometry as GeometryClass, Face3 as Face3Class } from 'three/examples/jsm/deprecated/Geometry';
import { Geometry as GeometryValue, Face3 as Face3Value } from './Geometry';
export const Geometry = GeometryValue as unknown as typeof GeometryClass;
export const Face3 = Face3Value as typeof Face3Class;
