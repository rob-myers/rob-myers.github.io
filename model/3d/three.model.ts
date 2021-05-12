import { Triple } from 'model/generic.model';
import { VectorJson } from 'model/geom';
import * as THREE from 'three';

export const identityMatrix4 = new THREE.Matrix4;

export function isGroupNode(x: THREE.Object3D): x is THREE.Group {
  return x.type === 'Group';
}

export function isMeshNode(x: THREE.Object3D): x is THREE.Mesh {
  return x.type === 'Mesh';
}

export function ndCoordsToGround(
  ndCoords: VectorJson,
  camera: THREE.Camera,
  output = new THREE.Vector3,
) {
  output.set(ndCoords.x, ndCoords.y, 0.5);
  output.unproject(camera).sub(camera.position).normalize();
  output.multiplyScalar((0 - camera.position.z) / output.z);
  output.add(camera.position);
  return output;
}

export function vectPrecision(v: THREE.Vector3, decimalPlaces: number) {
  return v.set(
    Number(v.x.toFixed(decimalPlaces)),
    Number(v.y.toFixed(decimalPlaces)),
    Number(v.z.toFixed(decimalPlaces)),
  );
}

/** Increments of 0.05, e.g. 3.15 */
export function vectPrecisionSpecial(v: THREE.Vector3) {
  return v.set(
    Number((Math.round(v.x / 0.05) * 0.05).toFixed(2)),
    Number((Math.round(v.y / 0.05) * 0.05).toFixed(2)),
    Number((Math.round(v.z / 0.05) * 0.05).toFixed(2)),
  );
}

/** Scale up to grid of 0.1 * 0.1 tiles */
export function scaleUpByTouched(from: THREE.Vector3, to: THREE.Vector3) {
  const dx = to.x - from.x, dy = to.y - from.y;
  from.x = (dx > 0 ? Math.floor : Math.ceil)(10 * from.x) / 10;
  from.y = (dy > 0 ? Math.floor : Math.ceil)(10 * from.y) / 10;
  vectPrecision(from, 1);
  to.x = (dx > 0 ? Math.ceil : Math.floor)(10 * to.x) / 10;
  to.y = (dy > 0 ? Math.ceil : Math.floor)(10 * to.y) / 10;
  vectPrecision(to, 1);
}

export function vectorToTriple({ x, y, z }: { x: number; y: number; z: number }): Triple<number> {
  return [x, y, z];
}

export function matrixToPosition(matrix: THREE.Matrix4, position: THREE.Vector3) {
  return position.set(
    matrix.elements[12],
    matrix.elements[13],
    0,
  );
}
