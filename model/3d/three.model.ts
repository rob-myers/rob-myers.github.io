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

export function loadJson<T extends THREE.Object3D>(rootJson: ThreeJson) {
  return new Promise<T>(resolve => {
    (new THREE.ObjectLoader).parse(rootJson, (x) => resolve(x as T));
  });
}

export function createPlaceholderGroup() {
  const group = new THREE.Group;
  const light = new THREE.DirectionalLight();
  light.position.set(-1, 3, 2);
  light.name = "TempLight";
  group.add(light);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: new THREE.Color('#0000ff')}),
    );
  mesh.position.setY(0.5);
  mesh.name = "TempCube";
  group.add(mesh);
  return group;
}

export function createThreeGroup(name: string) {
  const group = new THREE.Group;
  group.name = "Helpers";
  return group;
}

/** Rough and ready approach without "type" literal refinements */
export interface ThreeJson {
  geometries: ThreeGeometryJson[];
  materials: ThreeMaterialJson[];
  metadata: { version: number; type: string; generator: string; }
  object: ThreeObjectJson;
}

interface ThreeObjectJson {
  children: ThreeObjectJson[];
  matrix: number[];
  name: string;
  type: string;
  uuid: string;
}

interface ThreeGeometryJson {
  depth: number;
  depthSegments: number;
  height: number;
  heightSegments: number;
  type: string;
  uuid: string;
  width: number;
  widthSegments: number;
}

interface ThreeMaterialJson {
  color: number;
  colorWrite: boolean;
  depthFunc: number;
  depthTest: boolean;
  depthWrite: boolean;
  emissive: number;
  envMapIntensity: number;
  metalness: number;
  refractionRatio: number;
  roughness: number;
  stencilFail: number;
  stencilFunc: number;
  stencilFuncMask: number;
  stencilRef: number;
  stencilWrite: boolean;
  stencilWriteMask: number;
  stencilZFail: number;
  stencilZPass: number;
  type: string;
  uuid: string;
}
