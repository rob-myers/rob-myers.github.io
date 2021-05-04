/**
 * We use this facade to avoid three.js breaking server-side rendering.
 */
import { getWindow } from 'model/dom.model';

import type { SkeletonUtils as SkeletonUtilsNamespace } from 'three/examples/jsm/utils/SkeletonUtils';
export let SkeletonUtils: typeof SkeletonUtilsNamespace;

if (getWindow()) {
  import('three/examples/jsm/utils/SkeletonUtils').then((x) => SkeletonUtils = x.SkeletonUtils);
}
