declare module 'three-pathfinding' {
  import * as THREE from 'three';

  class Pathfinding {

    setZoneData(zoneId: string, zone: Zone): void;
    getRandomNode(zoneID: string, groupID: number, nearPosition: THREE.Vector3, nearRange: number): Node;
    getClosestNode(position: THREE.Vector3, zoneID: string, groupID: number, checkPolygon = false): Node;
    findPath(startPosition: THREE.Vector3, endPosition: THREE.Vector3, zoneID: string, groupID: number): THREE.Vector3[];
    getGroup(zoneID: string, position: THREE.Vector3): number;
    clampStep(start: THREE.Vector3, end: THREE.Vector3, node: Node, zoneID: string, groupID: number, endTarget: THREE.Vector3): Node;
    static createZone(geometry: THREE.BufferGeometry): Zone;

  };

  class PathfindingHelper extends THREE.Object3D {

    setPath(path: THREE.Vector3[]): this;
    setPlayerPosition(position: THREE.Vector3): this;
    setTargetPosition(position: THREE.Vector3): this;
    setNodePosition(position: THREE.Vector3): this;
    setStepPosition(position: THREE.Vector3): this;
    reset(): this;

  }

  interface Zone {
    groups: Group[];
    vertices: THREE.Vector3[];
  }

  type Group = Node[];

  /** A node is essentially a triangle */
  interface Node {
    id: number;
    neighbours: number[];
    vertexIds: [number, number, number];
    centroid: THREE.Vector3;
    portals: number[][];
    closed: boolean;
    cost: number;
  }

}