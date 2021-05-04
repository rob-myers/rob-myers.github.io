import safeJsonStringify from 'safe-json-stringify';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import useGeomStore from 'store/geom.store';
import { SkeletonUtils } from 'model/3d/facade';

/**
 * General purpose stage/shell utils, also for runtime.
 * Defining functions as properties exposes their key in `ls use.Util`.
 */
export class Util {

  static stringify = (...args: Parameters<typeof safeJsonStringify>) => {
    return jsonStringifyPrettyCompact(JSON.parse(safeJsonStringify(...args)));
  }

  static createBot = () => {
    // We assume respective gltf is loaded
    const { group: original, clips } = useGeomStore.getState().bot!;
    const group = SkeletonUtils.clone(original) as THREE.Group;
    group.scale.setScalar(0.025);
    group.children.forEach(x => x.castShadow = true);
    return { group, clips };
  }
}
