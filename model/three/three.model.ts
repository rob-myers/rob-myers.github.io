import * as THREE from 'three';

export const navMeshMaterial = new THREE.MeshStandardMaterial({
  color: 0xaa8686,
  opacity: 0.2,
  transparent: true,
  side: THREE.DoubleSide,
});

export function isGroupNode(x: THREE.Object3D): x is THREE.Group {
  return x.type === 'Group';
}

export function isMeshNode(x: THREE.Object3D): x is THREE.Mesh {
  return x.type === 'Mesh';
}

export const epsilon = 0.0001;

export type Coord3 = [number, number, number];


export function getScene(obj: THREE.Object3D): null | THREE.Object3D {
  if (obj.type === 'Scene') {
    return obj;
  } else  if (!obj.parent) {
    return null;
  }
  return getScene(obj.parent);
}

export function getChild(obj: THREE.Object3D, childName: string) {
  return obj.children.find(x => x.name === childName) || null;
}

export function getBounds(obj: THREE.Object3D) {
  return (new THREE.Box3).setFromObject(obj);
}

export function transformImportedMesh(mesh: THREE.Mesh) {
  mesh.position.set(0, 0, 0);
  mesh.geometry.rotateX(Math.PI/2);
  mesh.geometry.translate(0, 0, -mesh.geometry.boundingBox!.min.z);
  return mesh;
}

export const placeholderGroup = new THREE.Group;
export const placeholderMesh = new THREE.Mesh;
export const placeholderScene = new THREE.Scene;
