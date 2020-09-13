import * as THREE from 'three';

export function propsToAngle(props: TransformProps) {
  return 'e' in props ? 0
    : 's' in props ? -Math.PI/2
    : 'w' in props ? Math.PI
    : 'n' in props ? Math.PI/2 : 0;
}

export type TransformProps = {
  x?: number;
  y?: number;
} & (
  | { e?: boolean }
  | { s?: boolean }
  | { w?: boolean }
  | { n?: boolean }
)

export const navMeshMaterial = new THREE.MeshBasicMaterial({
  color: 0x888888,
  opacity: 0.2,
  transparent: true,
  side: THREE.DoubleSide,
});

/** THREE.Group containing a single Inner */
export const innerGroupName = 'innerGroup';

export const navmeshGroupName = 'navmesh';

export const outsetAmount = 0.3;
