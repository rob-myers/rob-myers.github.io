import { Utils } from './Utils';
import { Vect } from '../geom/vect';

export class Builder {

  /**
   * Constructs groups from the given navigation mesh.
   * @param  {Geom.TriangulationJson} tr
   */
  static buildZone(tr) {
    const navMesh = this._buildNavigationMesh(tr);
    navMesh.vertices.forEach((v) => {
      v.x = Utils.roundNumber(v.x, 2);
      v.y = Utils.roundNumber(v.y, 2);
    });

    const zone = /** @type {Nav.Zone} */ ({});
    zone.vertices = navMesh.vertices;

    const groups = this._buildPolygonGroups(navMesh);

    // TODO: This block represents a large portion of navigation mesh construction time
    // and could probably be optimized. For example, construct portals while
    // determining the neighbor graph.
    zone.groups = new Array(groups.length);
    groups.forEach((group, groupIndex) => {

      const indexByPolygon = /** @type {Map<Nav.NavPoly, number>} */ (new Map()); // { polygon: index in group }
      group.forEach((poly, polyIndex) => indexByPolygon.set(poly, polyIndex));

      const newGroup = /** @type {Nav.GraphNode[]} */ (new Array(group.length));
      group.forEach((poly, polyIndex) => {

        const neighbourIndices = /** @type {number[]} */ ([]);
        poly.neighbours.forEach((n) => neighbourIndices.push(
          /** @type {number} */ (indexByPolygon.get(n))));

        // Build a portal list to each neighbour
        const portals = /** @type {number[][]} */ ([]);
        poly.neighbours.forEach((n) => portals.push(this._getSharedVerticesInOrder(poly, n)));

        const centroid = new Vect(0, 0);
        centroid.add( zone.vertices[ poly.vertexIds[0] ] );
        centroid.add( zone.vertices[ poly.vertexIds[1] ] );
        centroid.add( zone.vertices[ poly.vertexIds[2] ] );
        centroid.scale(1 / 3);
        centroid.x = Utils.roundNumber(centroid.x, 2);
        centroid.y = Utils.roundNumber(centroid.y, 2);

        newGroup[polyIndex] = /** @type {Nav.GraphNode} */ ({
          id: polyIndex,
          centroid,
          neighbours: neighbourIndices,
          portals,
          vertexIds: poly.vertexIds,
        });
      });

      zone.groups[groupIndex] = newGroup;
    });

    return zone;
  }

  /**
   * Constructs a navigation mesh from the given geometry.
   * @param {Geom.TriangulationJson} triangulation
   */
  static _buildNavigationMesh (triangulation) {
    return this._buildPolygonsFromTriang(triangulation);
  }

  /**
   * Spreads the group ID of the given polygon to all connected polygons
   * @param {Nav.NavPoly} seed
   */
  static _spreadGroupId (seed) {
    let nextBatch = new Set([seed]);

    while(nextBatch.size > 0) {
      const batch = nextBatch;
      nextBatch = new Set();

      batch.forEach((polygon) => {
        polygon.group = seed.group;
        polygon.neighbours.forEach((neighbour) => {
          if(neighbour.group === undefined) {
            nextBatch.add(neighbour);
          }
        });
      });
    }
  }

  /**
   * @param {{ polygons: Nav.NavPoly[] }} navigationMesh 
   */
  static _buildPolygonGroups (navigationMesh) {
    const polygons = navigationMesh.polygons;
    const polygonGroups = /** @type {Nav.NavPoly[][]} */ ([]);

    polygons.forEach((polygon) => {
      if (polygon.group !== undefined) {
        // this polygon is already part of a group
        polygonGroups[polygon.group].push(polygon);
      } else {
        // we need to make a new group and spread its ID to neighbors
        polygon.group = polygonGroups.length;
        this._spreadGroupId(polygon);
        polygonGroups.push([polygon]);
      }
    });

    return polygonGroups;
  }

  /**
   * @param {Nav.NavPoly} polygon 
   * @param {Record<number, Nav.NavPoly[]>} vertexPolygonMap 
   */
  static _buildPolygonNeighbours (polygon, vertexPolygonMap) {
    const neighbours = /** @type {Set<Nav.NavPoly>} */ (new Set());

    const groupA = vertexPolygonMap[polygon.vertexIds[0]];
    const groupB = vertexPolygonMap[polygon.vertexIds[1]];
    const groupC = vertexPolygonMap[polygon.vertexIds[2]];

    // It's only necessary to iterate groups A and B. Polygons contained only
    // in group C cannot share a >1 vertex with this polygon.
    // IMPORTANT: Bublé cannot compile for-of loops.
    groupA.forEach((candidate) => {
      if (candidate === polygon) return;
      if (groupB.includes(candidate) || groupC.includes(candidate)) {
        neighbours.add(candidate);
      }
    });
    groupB.forEach((candidate) => {
      if (candidate === polygon) return;
      if (groupC.includes(candidate)) {
        neighbours.add(candidate);
      }
    });

    return neighbours;
  }

  /** @param {Geom.TriangulationJson} tr */
  static _buildPolygonsFromTriang (tr) {

    const polygons = /** @type {Nav.NavPoly[]} */ ([]);
    const vertices = /** @type {Vect[]} */ ([]);

    // const position = tr.attributes.position;
    // const index = tr.index;

    // Constructing the neighbor graph brute force is O(n²). To avoid that,
    // create a map from vertices to the polygons that contain them, and use it
    // while connecting polygons. This reduces complexity to O(n*m), where 'm'
    // is related to connectivity of the mesh.

    /** Array of polygon objects by vertex index. */
    const vertexPolygonMap = /** @type {Record<number, Nav.NavPoly[]>} */ ({});

    for (let i = 0; i < tr.vs.length; i++) {
      vertices.push(Vect.from(tr.vs[i]));
      vertexPolygonMap[i] = [];
    }

    // Convert the faces into a custom format that supports more than 3 vertices
    for (let i = 0; i < tr.tris.length; i++) {
      const [a, b, c] = tr.tris[i];
      const poly = /** @type {Nav.NavPoly} */ ({ vertexIds: [a, b, c] });
      polygons.push(poly);
      vertexPolygonMap[a].push(poly);
      vertexPolygonMap[b].push(poly);
      vertexPolygonMap[c].push(poly);
    }

    // Build a list of adjacent polygons
    polygons.forEach((polygon) => {
      polygon.neighbours = this._buildPolygonNeighbours(polygon, vertexPolygonMap);
    });

    return { polygons, vertices };
  }

  /**
   * @param {Nav.NavPoly} a
   * @param {Nav.NavPoly} b
   * @returns {number[]}
   */
  static _getSharedVerticesInOrder (a, b) {

    const aList = a.vertexIds;
    const a0 = aList[0], a1 = aList[1], a2 = aList[2];

    const bList = b.vertexIds;
    const shared0 = bList.includes(a0);
    const shared1 = bList.includes(a1);
    const shared2 = bList.includes(a2);

    // it seems that we shouldn't have an a and b with <2 shared vertices here unless there's a bug
    // in the neighbor identification code, or perhaps a malformed input geometry; 3 shared vertices
    // is a kind of embarrassing but possible geometry we should handle
    if (shared0 && shared1 && shared2) {
      return /** @type {[number, number]} */ (Array.from(aList));
    } else if (shared0 && shared1) {
      return [a0, a1];
    } else if (shared1 && shared2) {
      return [a1, a2];
    } else if (shared0 && shared2) {
      return [a2, a0]; // this ordering will affect the string pull algorithm later, not clear if significant
    } else {
      console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found.");
      return [];
    }
  }
}
