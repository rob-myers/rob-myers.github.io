import { Mesh, Vector3 } from "three";
import { Geometry, Face3 } from "model/3d/deprecated";

const Recast = require('recast-detour');

/**
 * RecastJS navigation plugin
 * https://github.com/BabylonJS/Babylon.js/blob/master/src/Navigation/Plugins/recastJSPlugin.ts
 */
class RecastService {
  /** Reference to the Recast library */
  public bjsRECAST: any = {};
  /** plugin name */
  public name: string = "RecastJSPlugin";
  /** Navmeshes by key */
  public lookup: Record<string, any>;

  /**
   * Initializes the recastJS plugin
   * @param recastInjection can be used to inject your own recast reference
   */
  public constructor(recastInjection: any = Recast) {
    if (typeof recastInjection === "function") {
      recastInjection(this.bjsRECAST);
    } else {
      this.bjsRECAST = recastInjection;
    }
    this.lookup = {};

    if (!this.isSupported()) {
      console.error("RecastJS is not available. Please make sure you included the js file.");
      return;
    }
  }

  /**
   * Creates a navigation mesh
   * @param meshes array of all the geometry used to compute the navigatio mesh
   * @param parameters bunch of parameters used to filter geometry
   */
  // createNavMesh(meshes: Array<THREE.Mesh>, parameters: INavMeshParameters): void {
  createNavMesh(
    navKey: string,
    navGeom: THREE.BufferGeometry,
    parameters = defaultNavMeshParams,
  ): void {
    const rc = new this.bjsRECAST.rcConfig();
    rc.cs = parameters.cs;
    rc.ch = parameters.ch;
    rc.borderSize = 0;
    rc.tileSize = 0;
    rc.walkableSlopeAngle = parameters.walkableSlopeAngle;
    rc.walkableHeight = parameters.walkableHeight;
    rc.walkableClimb = parameters.walkableClimb;
    rc.walkableRadius = parameters.walkableRadius;
    rc.maxEdgeLen = parameters.maxEdgeLen;
    rc.maxSimplificationError = parameters.maxSimplificationError;
    rc.minRegionArea = parameters.minRegionArea;
    rc.mergeRegionArea = parameters.mergeRegionArea;
    rc.maxVertsPerPoly = parameters.maxVertsPerPoly;
    rc.detailSampleDist = parameters.detailSampleDist;
    rc.detailSampleMaxError = parameters.detailSampleMaxError;

    const navMesh = new this.bjsRECAST.NavMesh();
    this.lookup[navKey] = navMesh;

    // var index: number;
    // var tri: number;
    // var pt: number;

    // var indices = [];
    // var positions = [];
    // var offset = 0;
    // for (index = 0; index < meshes.length; index++) {
    //     if (meshes[index]) {
    //         var mesh = meshes[index];

    //         const meshIndices = mesh.getIndices();
    //         if (!meshIndices) {
    //             continue;
    //         }
    //         const meshPositions = mesh.getVerticesData(VertexBuffer.PositionKind, false, false);
    //         if (!meshPositions) {
    //             continue;
    //         }

    //         const wm = mesh.computeWorldMatrix(true);

    //         for (tri = 0; tri < meshIndices.length; tri++) {
    //             indices.push(meshIndices[tri] + offset);
    //         }

    //         var transformed = Vector3.Zero();
    //         var position = Vector3.Zero();
    //         for (pt = 0; pt < meshPositions.length; pt += 3) {
    //             Vector3.FromArrayToRef(meshPositions, pt, position);
    //             Vector3.TransformCoordinatesToRef(position, wm, transformed);
    //             positions.push(transformed.x, transformed.y, transformed.z);
    //         }

    //         offset += meshPositions.length / 3;
    //     }
    // }

    const geometry = (new Geometry).fromBufferGeometry(navGeom);
    const positions = geometry.vertices.flatMap(v => [v.x, v.y, v.z]);
    const offset = geometry.vertices.length;
    const indices = geometry.faces.flatMap(f => [f.a, f.b, f.c]);
    // console.log(positions, offset, indices);

    navMesh.build(
      positions, // [x1, y1, z1,  x2, y2, z2, ...]
      offset, // Number of vectors
      indices, // Triangle ids [ v1, v2, v3,  v1, v2, v4,  ... ]
      indices.length, // Number of triangles
      rc,
    );
  }

  /**
   * Create a navigation mesh debug mesh
   * @returns debug display mesh
   */
  createDebugNavMesh(navKey: string): THREE.Mesh {
    let tri: number, pt: number;
    const debugNavMesh = this.lookup[navKey].getDebugNavMesh();
    const triangleCount = debugNavMesh.getTriangleCount();

    const indices = [] as number[];
    const positions = [] as number[];
    for (tri = 0; tri < triangleCount * 3; tri++) {
      indices.push(tri);
    }
    for (tri = 0; tri < triangleCount; tri++) {
      for (pt = 0; pt < 3 ; pt++) {
        const point = debugNavMesh.getTriangle(tri).getPoint(pt);
        positions.push(point.x, point.y, point.z);
      }
    }

    const geometry = new Geometry;
    geometry.vertices = [...Array(positions.length / 3)]
      .map((_, i) => new Vector3(...positions.slice(3 * i, 3 * (i + 1)) ));
    geometry.faces = [...Array(indices.length / 3)]
      .map((_, i) => new Face3(...indices.slice(3 * i, 3 * (i + 1)) as [number, number, number] ));
    const mesh = new Mesh(geometry.toBufferGeometry());
    mesh.name = "NavMeshDebug";

    return mesh;
  }

  /**
   * Get a navigation mesh constrained position, closest to the parameter position
   * @param position world position
   * @returns the closest point to position constrained by the navigation mesh
   */
  getClosestPoint(navKey: string, position: Vector3) : Vector3 {
    var p = new this.bjsRECAST.Vec3(position.x, position.y, position.z);
    var ret = this.lookup[navKey].getClosestPoint(p);
    var pr = new Vector3(ret.x, ret.y, ret.z);
    return pr;
  }

  /**
   * Get a navigation mesh constrained position, closest to the parameter position
   * @param position world position
   * @param result output the closest point to position constrained by the navigation mesh
   */
  getClosestPointToRef(navKey: string, position: Vector3, result: Vector3) : void {
    var p = new this.bjsRECAST.Vec3(position.x, position.y, position.z);
    var ret = this.lookup[navKey].getClosestPoint(p);
    result.set(ret.x, ret.y, ret.z);
  }

  /**
   * Get a navigation mesh constrained position, within a particular radius
   * @param position world position
   * @param maxRadius the maximum distance to the constrained world position
   * @returns the closest point to position constrained by the navigation mesh
   */
  getRandomPointAround(navKey: string, position: Vector3, maxRadius: number): Vector3 {
    var p = new this.bjsRECAST.Vec3(position.x, position.y, position.z);
    var ret = this.lookup[navKey].getRandomPointAround(p, maxRadius);
    var pr = new Vector3(ret.x, ret.y, ret.z);
    return pr;
  }

  /**
   * Get a navigation mesh constrained position, within a particular radius
   * @param position world position
   * @param maxRadius the maximum distance to the constrained world position
   * @param result output the closest point to position constrained by the navigation mesh
   */
  getRandomPointAroundToRef(navKey: string, position: Vector3, maxRadius: number, result: Vector3): void {
    var p = new this.bjsRECAST.Vec3(position.x, position.y, position.z);
    var ret = this.lookup[navKey].getRandomPointAround(p, maxRadius);
    result.set(ret.x, ret.y, ret.z);
  }

  /**
   * Compute the final position from a segment made of destination-position
   * @param position world position
   * @param destination world position
   * @returns the resulting point along the navmesh
   */
  moveAlong(navKey: string, position: Vector3, destination: Vector3): Vector3 {
    var p = new this.bjsRECAST.Vec3(position.x, position.y, position.z);
    var d = new this.bjsRECAST.Vec3(destination.x, destination.y, destination.z);
    var ret = this.lookup[navKey].moveAlong(p, d);
    var pr = new Vector3(ret.x, ret.y, ret.z);
    return pr;
  }

  /**
   * Compute the final position from a segment made of destination-position
   * @param position world position
   * @param destination world position
   * @param result output the resulting point along the navmesh
   */
  moveAlongToRef(navKey: string, position: Vector3, destination: Vector3, result: Vector3): void {
    var p = new this.bjsRECAST.Vec3(position.x, position.y, position.z);
    var d = new this.bjsRECAST.Vec3(destination.x, destination.y, destination.z);
    var ret = this.lookup[navKey].moveAlong(p, d);
    result.set(ret.x, ret.y, ret.z);
  }

  /**
   * Compute a navigation path from start to end. Returns an empty array if no path can be computed
   * @param start world position
   * @param end world position
   * @returns array containing world position composing the path
   */
  computePath(navKey: string, start: Vector3, end: Vector3): Vector3[] {
    var pt: number;
    let startPos = new this.bjsRECAST.Vec3(start.x, start.y, start.z);
    let endPos = new this.bjsRECAST.Vec3(end.x, end.y, end.z);
    let navPath = this.lookup[navKey].computePath(startPos, endPos);
    let pointCount = navPath.getPointCount();
    var positions = [];
    for (pt = 0; pt < pointCount; pt++) {
      let p = navPath.getPoint(pt);
      positions.push(new Vector3(p.x, p.y, p.z));
    }
    return positions;
  }

  /**
   * Set the Bounding box extent for doing spatial queries (getClosestPoint, getRandomPointAround, ...)
   * The queries will try to find a solution within those bounds
   * default is (1,1,1)
   * @param extent x,y,z value that define the extent around the queries point of reference
   */
  setDefaultQueryExtent(navKey: string, extent: Vector3): void {
    let ext = new this.bjsRECAST.Vec3(extent.x, extent.y, extent.z);
    this.lookup[navKey].setDefaultQueryExtent(ext);
  }

  /**
   * Get the Bounding box extent specified by setDefaultQueryExtent
   * @returns the box extent values
   */
  getDefaultQueryExtent(navKey: string): Vector3 {
    const p = this.lookup[navKey].getDefaultQueryExtent();
    return new Vector3(p.x, p.y, p.z);
  }

  /**
   * build the navmesh from a previously saved state using getNavmeshData
   * @param data the Uint8Array returned by getNavmeshData
   */
  buildFromNavmeshData(navKey: string, data: Uint8Array): void {
    var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    var dataPtr = this.bjsRECAST._malloc(nDataBytes);

    var dataHeap = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(data);

    let buf = new this.bjsRECAST.NavmeshData();
    buf.dataPointer = dataHeap.byteOffset;
    buf.size = data.length;
    this.lookup[navKey] = new this.bjsRECAST.NavMesh();
    this.lookup[navKey].buildFromNavmeshData(buf);

    // Free memory
    this.bjsRECAST._free(dataHeap.byteOffset);
  }

  /**
   * returns the navmesh data that can be used later. The navmesh must be built before retrieving the data
   * @returns data the Uint8Array that can be saved and reused
   */
  getNavmeshData(navKey: string): Uint8Array {
    let navmeshData = this.lookup[navKey].getNavmeshData();
    var arrView = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, navmeshData.dataPointer, navmeshData.size);
    var ret = new Uint8Array(navmeshData.size);
    ret.set(arrView);
    this.lookup[navKey].freeNavmeshData(navmeshData);
    return ret;
  }

  /**
   * Get the Bounding box extent result specified by setDefaultQueryExtent
   * @param result output the box extent values
   */
  getDefaultQueryExtentToRef(navKey: string, result: Vector3): void {
    let p = this.lookup[navKey].getDefaultQueryExtent();
    result.set(p.x, p.y, p.z);
  }

  /**
   * Disposes
   */
  public dispose() {
    this.lookup = {};
  }

  /**
   * If this plugin is supported
   * @returns true if plugin is supported
   */
  public isSupported(): boolean {
    return this.bjsRECAST !== undefined;
  }
}

let defaultNavMeshParams: INavMeshParameters = {
  cs: 0.2,
  ch: 0.2,
  walkableSlopeAngle: 0,
  walkableHeight: 3,
  walkableClimb: 1,
  walkableRadius: 0,
  maxEdgeLen: 12,
  maxSimplificationError: 1.3,
  minRegionArea: 8,
  mergeRegionArea: 20,
  maxVertsPerPoly: 6,
  detailSampleDist: 6,
  detailSampleMaxError: 1,
};

/**
 * Configures the navigation mesh creation
 */
export interface INavMeshParameters {
  /**
   * The xz-plane cell size to use for fields. [Limit: > 0] [Units: wu]
   */
  cs: number;

  /**
   * The y-axis cell size to use for fields. [Limit: > 0] [Units: wu]
   */
  ch: number;

  /**
   * The maximum slope that is considered walkable. [Limits: 0 <= value < 90] [Units: Degrees]
   */
  walkableSlopeAngle: number;

  /**
   * Minimum floor to 'ceiling' height that will still allow the floor area to
   * be considered walkable. [Limit: >= 3] [Units: vx]
   */
  walkableHeight: number;

  /**
   * Maximum ledge height that is considered to still be traversable. [Limit: >=0] [Units: vx]
   */
  walkableClimb: number;

  /**
   * The distance to erode/shrink the walkable area of the heightfield away from
   * obstructions.  [Limit: >=0] [Units: vx]
   */
  walkableRadius: number;

  /**
   * The maximum allowed length for contour edges along the border of the mesh. [Limit: >=0] [Units: vx]
   */
  maxEdgeLen: number;

  /**
   * The maximum distance a simplfied contour's border edges should deviate
   * the original raw contour. [Limit: >=0] [Units: vx]
   */
  maxSimplificationError: number;

  /**
   * The minimum number of cells allowed to form isolated island areas. [Limit: >=0] [Units: vx]
   */
  minRegionArea: number;

  /**
   * Any regions with a span count smaller than this value will, if possible,
   * be merged with larger regions. [Limit: >=0] [Units: vx]
   */
  mergeRegionArea: number;

  /**
   * The maximum number of vertices allowed for polygons generated during the
   * contour to polygon conversion process. [Limit: >= 3]
   */
  maxVertsPerPoly: number;

  /**
   * Sets the sampling distance to use when generating the detail mesh.
   * (For height detail only.) [Limits: 0 or >= 0.9] [Units: wu]
   */
  detailSampleDist: number;

  /**
   * The maximum distance the detail mesh surface should deviate from heightfield
   * data. (For height detail only.) [Limit: >=0] [Units: wu]
   */
  detailSampleMaxError: number;
}

export const recastService = new RecastService;