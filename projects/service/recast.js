import { Vect } from '../geom';
import { Triangulation, VectJson } from '../geom/types';

/**
 * RecastJS navigation plugin
 * https://github.com/BabylonJS/Babylon.js/blob/master/src/Navigation/Plugins/recastJSPlugin.ts
 * Restricted to 2-dim plane X * {0} * Y.
 */
class RecastService {

  /** Initializes the recastJS plugin */
  constructor() {
    /** @type {any} Reference to the Recast library */
    this.bjsRECAST = {};
    /** @type {"RecastJSPlugin"} plugin name */
    this.name = "RecastJSPlugin";
    /** @type {Record<string, any>} Navmeshes by key */
    this.lookup = {};
    /** @type {((value?: any) => void)[]} */
    this.readyResolvers = [];
  }

  async ready() {
    if (!this.bjsRECAST.NavMesh) {
      return new Promise(resolve => {
        this.readyResolvers.push(resolve);
      });
    }
  }
  
  /** @param {any} Recast */
  initialize(Recast) {
    Recast(this.bjsRECAST);
    if (!this.bjsRECAST.NavMesh) {
      return console.error("RecastJS is not available. Please make sure you included the js file.");
    }
    while (this.readyResolvers.length) {
      this.readyResolvers.pop()?.();
    }
  }

  /** @param {string} navKey */
  clearNavMesh(navKey) {
    delete this.lookup[navKey];
  }

  /**
   * Creates a navigation mesh
   * @param {string} navKey
   * @param {Triangulation} navGeom array of all the geometry used to compute the navigatio mesh
   * @param {INavMeshParameters} parameters bunch of parameters used to filter geometry
   * @returns {void}
   */
  createNavMesh(
    navKey,
    navGeom,
    parameters = defaultNavMeshParams,
  ) {

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

    const navMesh = new this.bjsRECAST.NavMesh;
    this.lookup[navKey] = navMesh;

    const positions = navGeom.vs.flatMap(v => [v.x, 0, v.y]);
    const offset = navGeom.vs.length;
    const indices = navGeom.tris.flatMap(f => f);
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
   * Create a triangulation from the navigation mesh.
   * @param {string} navKey
   * @returns {Triangulation}
   */
  createDebugNavMesh(navKey) {
    if (!this.lookup[navKey]) {
      return { vs: [], tris: [] };
    }

    /** @type {number} */
    let tri;
    /** @type {number} */
    let pt;
    const debugNavMesh = this.lookup[navKey].getDebugNavMesh();
    const triangleCount = debugNavMesh.getTriangleCount();

    /** @type {[number, number, number][]} */
    const indices = [];
    /** @type {Vect[]} */
    const positions = [];

    for (tri = 0; tri < triangleCount * 3; tri += 3)
      indices.push([tri, tri + 1, tri + 2]);

    for (tri = 0; tri < triangleCount; tri++) {
      for (pt = 0; pt < 3 ; pt++) {
        const point = debugNavMesh.getTriangle(tri).getPoint(pt);
        // positions.push(point.x, point.y, point.z);
        positions.push(new Vect(point.x, point.z));
      }
    }

    return { vs: positions, tris: indices };
  }

  /**
   * Get a navigation mesh constrained position, closest to the parameter position
   * @param {string} navKey
   * @param {VectJson} position world position
   * @returns {VectJson} the closest point to position constrained by the navigation mesh
   */
  getClosestPoint(navKey, position) {
    const p = new this.bjsRECAST.Vec3(position.x, 0, position.y);
    const ret = this.lookup[navKey].getClosestPoint(p);
    return { x: ret.x, y: ret.z };
  }

  /**
   * Get a navigation mesh constrained position, closest to the parameter position
   * @param {string} navKey
   * @param {VectJson} position world position
   * @param {VectJson} result output the closest point to position constrained by the navigation mesh
   * @returns {void}
   */
  getClosestPointToRef(navKey, position, result) {
    const p = new this.bjsRECAST.Vec3(position.x, 0, position.y);
    const ret = this.lookup[navKey].getClosestPoint(p);
    result.x = ret.x;
    result.y = ret.z;
  }

  /**
   * Get a navigation mesh constrained position, within a particular radius
   * @param {string} navKey
   * @param {VectJson} position world position: ;
   * @param {number} maxRadius the maximum distance to the constrained world position
   * @returns {VectJson} the closest point to position constrained by the navigation mesh
   */
  getRandomPointAround(navKey, position, maxRadius) {
    const p = new this.bjsRECAST.Vec3(position.x, 0, position.y);
    const ret = this.lookup[navKey].getRandomPointAround(p, maxRadius);
    return { x: ret.x, y: ret.z };
  }

  /**
   * Get a navigation mesh constrained position, within a particular radius
   * @param {string} navKey
   * @param {VectJson} position world position: ;
   * @param {number} maxRadius the maximum distance to the constrained world position
   * @param {VectJson} result output the closest point to position constrained by the navigation mesh
   */
  getRandomPointAroundToRef(navKey, position, maxRadius, result) {
    var p = new this.bjsRECAST.Vec3(position.x, 0, position.y);
    var ret = this.lookup[navKey].getRandomPointAround(p, maxRadius);
    result.x = ret.x;
    result.y = ret.z;
  }

  /**
   * Compute the final position from a segment made of destination-position
   * @param {string} navKey
   * @param {VectJson} position world position
   * @param {VectJson} destination world position
   * @returns {VectJson} the resulting point along the navmesh
   */
  moveAlong(navKey, position, destination) {
    var p = new this.bjsRECAST.Vec3(position.x, 0, position.y);
    var d = new this.bjsRECAST.Vec3(destination.x, 0, destination.y);
    var ret = this.lookup[navKey].moveAlong(p, d);
    return { x: ret.x, y: ret.z }
  }

  /**
   * Compute the final position from a segment made of destination-position
   * @param {string} navKey
   * @param {VectJson} position world position
   * @param {VectJson} destination world position
   * @param {VectJson} result output the resulting point along the navmesh
   * @returns {void}
   */
  moveAlongToRef(navKey, position, destination, result) {
    const p = new this.bjsRECAST.Vec3(position.x, 0, position.y);
    const d = new this.bjsRECAST.Vec3(destination.x, 0, destination.y);
    const ret = this.lookup[navKey].moveAlong(p, d);
    result.x = ret.x;
    result.y = ret.z;
  }

  /**
   * Compute a navigation path from start to end. Returns an empty array if no path can be computed
   * @param {string} navKey
   * @param {VectJson} start world position
   * @param {VectJson} end position
   * @returns {Vect[]} array containing world position composing the path
   */
  computePath(navKey, start, end) {
    if (!this.lookup[navKey]) {
      console.warn(`navmesh: ${navKey}: not found`);
      return [];
    }
    /** @type {number} */
    let pt;
    const startPos = new this.bjsRECAST.Vec3(start.x, 0, start.y);
    const endPos = new this.bjsRECAST.Vec3(end.x, 0, end.y);
    const navPath = this.lookup[navKey].computePath(startPos, endPos);
    const pointCount = navPath.getPointCount();
    /** @type {Vect[]} */
    const positions = [];
    for (pt = 0; pt < pointCount; pt++) {
      let p = navPath.getPoint(pt);
      positions.push(new Vect(p.x, p.z));
    }
    return positions;
  }

  /**
   * Set the Bounding box extent for doing spatial queries (getClosestPoint, getRandomPointAround, ...)
   * The queries will try to find a solution within those bounds
   * default is (1,1,1)
   * @param {string} navKey
   * @param {VectJson} extent x,y,z value that define the extent around the queries point of reference
   * @returns {void}
   */
  setDefaultQueryExtent(navKey, extent) {
    let ext = new this.bjsRECAST.Vec3(extent.x, 0, extent.y);
    this.lookup[navKey].setDefaultQueryExtent(ext);
  }

  /**
   * Get the Bounding box extent specified by setDefaultQueryExtent
   * @param {string} navKey
   * @returns {VectJson} the box extent values
   */
  getDefaultQueryExtent(navKey) {
    const p = this.lookup[navKey].getDefaultQueryExtent();
    return { x: p.x, y: p.z };
  }

  /**
   * build the navmesh from a previously saved state using getNavmeshData
   * @param {string} navKey
   * @param {Uint8Array} data the Uint8Array returned by getNavmeshData
   * @returns {void}
   */
  buildFromNavmeshData(navKey, data) {
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
   * @param {string} navKey
   * @returns {Uint8Array} data the Uint8Array that can be saved and reused
   */
  getNavmeshData(navKey) {
    let navmeshData = this.lookup[navKey].getNavmeshData();
    var arrView = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, navmeshData.dataPointer, navmeshData.size);
    var ret = new Uint8Array(navmeshData.size);
    ret.set(arrView);
    this.lookup[navKey].freeNavmeshData(navmeshData);
    return ret;
  }

  /**
   * Get the Bounding box extent result specified by setDefaultQueryExtent
   * @param {string} navKey
   * @param {VectJson} result output the box extent values
   * @returns {void}
   */
  getDefaultQueryExtentToRef(navKey, result) {
    let p = this.lookup[navKey].getDefaultQueryExtent();
    result.x = p.x;
    result.y = p.z;
  }

  /**
   * Disposes
   */
  dispose() {
    this.lookup = {};
  }
}

/** @type {INavMeshParameters} */
let defaultNavMeshParams = {
  cs: 0.005,
  ch: 0.1,
  walkableSlopeAngle: 0,
  walkableHeight: 3,
  walkableClimb: 1,
  walkableRadius: 0,
  maxEdgeLen: 12,
  maxSimplificationError: 0.001,
  minRegionArea: 8,
  mergeRegionArea: 20,
  maxVertsPerPoly: 6,
  detailSampleDist: 6,
  detailSampleMaxError: 0.1,
};

/**
 * Configures the navigation mesh creation
 * @typedef INavMeshParameters
 * @type {object}
 * @property {number} cs The xz-plane cell size to use for fields. [Limit: > 0] [Units: wu]
 * @property {number} ch The y-axis cell size to use for fields. [Limit: > 0] [Units: wu]
 * @property {number} walkableSlopeAngle The maximum slope that is considered walkable. [Limits: 0 <= value < 90] [Units: Degrees]
 * @property {number} walkableHeight Minimum floor to 'ceiling' height that will still allow the floor area to
 * be considered walkable. [Limit: >= 3] [Units: vx]
 * @property {number} walkableClimb Maximum ledge height that is considered to still be traversable. [Limit: >=0] [Units: vx]
 * @property {number} walkableRadius The distance to erode/shrink the walkable area of the heightfield away from
 * obstructions.  [Limit: >=0] [Units: vx]
 * @property {number} maxEdgeLen The maximum allowed length for contour edges along the border of the mesh. [Limit: >=0] [Units: vx]
 * @property {number} maxSimplificationError The maximum distance a simplfied contour's border edges should deviate
 * the original raw contour. [Limit: >=0] [Units: vx]
 * @property {number} minRegionArea The minimum number of cells allowed to form isolated island areas. [Limit: >=0] [Units: vx]
 * @property {number} mergeRegionArea Any regions with a span count smaller than this value will, if possible,
 * be merged with larger regions. [Limit: >=0] [Units: vx]
 * @property {number} maxVertsPerPoly The maximum number of vertices allowed for polygons generated during the
 * contour to polygon conversion process. [Limit: >= 3]
 * @property {number} detailSampleDist Sets the sampling distance to use when generating the detail mesh.
 * (For height detail only.) [Limits: 0 or >= 0.9] [Units: wu]
 * @property {number} detailSampleMaxError The maximum distance the detail mesh surface should deviate from heightfield
 * data. (For height detail only.) [Limit: >=0] [Units: wu]
 */

if (typeof self !== 'undefined') {
  import('recast-detour').then((module) => {
    recast.initialize(module.default);
    // console.log('Recast', self.Recast);
  });
}

export const recast = new RecastService;
