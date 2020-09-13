export function isGroupNode(x: THREE.Object3D): x is THREE.Group {
  return x.type === 'Group';
}

export function isMeshNode(x: THREE.Object3D): x is THREE.Mesh {
  return x.type === 'Mesh';
}

export const epsilon = 0.0001;

export type Coord3 = [number, number, number];

export const outsetAmount = 0.3;

export function getScene(obj: THREE.Object3D): null | THREE.Object3D {
  if (obj.type === 'Scene') {
    return obj;
  } else  if (!obj.parent) {
    return null;
  }
  return getScene(obj.parent);
}
