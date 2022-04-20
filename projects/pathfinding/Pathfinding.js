import { Utils } from './Utils';
import { AStar } from './AStar';
import { Builder } from './Builder';
import { Channel } from './Channel';

import { Vect } from '../geom';
import { Triangle } from './Triangle';

/**
 * Defines an instance of the pathfinding module, with one or more zones.
 */
export class Pathfinding {

  constructor () {
    /** @type {Record<string, Nav.Zone>} */
    this.zones = {};

    /**
     * @readonly
     * @type {500}
     */
    this.MAX_DIST_TO_SOME_CENTROID = 500;

    const temp = {
      point: new Vect,
      triangle: new Triangle,
      endPoint: new Vect,
      closestNode: /** @type {null | Nav.GraphNode} */ (null),
      closestPoint: new Vect,
      closestDistance: Infinity,
    };

    /** @type {typeof temp} */
    this.temp = temp;

  }

  /**
   * Clamps a step along the navmesh, given start and desired endpoint.
   * May be used to constrain first-person / WASD controls.
   *
   * @param  {Vect} startRef
   * @param  {Vect} endRef Desired endpoint.
   * @param  {Nav.GraphNode} node
   * @param  {string} zoneID
   * @param  {number} groupID
   * @param  {Vect} endTarget Updated endpoint.
   */
  clampStep(startRef, endRef, node, zoneID, groupID, endTarget) {
    const vertices = this.zones[zoneID].vertices;
    const nodes = this.zones[zoneID].groups[groupID];

    const nodeQueue = [node];
    const nodeDepth = /** @type {Record<number, number>} */ ({});
    nodeDepth[node.id] = 0;

    const t = this.temp;
    t.closestNode = null;
    t.closestPoint.set(0, 0);
    t.closestDistance = Infinity;
    t.endPoint.copy(endRef);

    for (let currentNode = nodeQueue.pop(); currentNode; currentNode = nodeQueue.pop()) {

      t.triangle.set(
        vertices[currentNode.vertexIds[0]],
        vertices[currentNode.vertexIds[1]],
        vertices[currentNode.vertexIds[2]]
      );

      t.triangle.closestPointToPoint(t.endPoint, t.point);

      if (t.point.distanceToSquared(t.endPoint) < t.closestDistance) {
        t.closestNode = currentNode;
        t.closestPoint.copy(t.point);
        t.closestDistance = t.point.distanceToSquared(t.endPoint);
      }

      const depth = nodeDepth[currentNode.id];
      if (depth > 2) continue;

      for (let i = 0; i < currentNode.neighbours.length; i++) {
        /** @type {Nav.GraphNode} */
        const neighbour = nodes[currentNode.neighbours[i]];
        if (neighbour.id in nodeDepth) continue;

        nodeQueue.push(neighbour);
        nodeDepth[neighbour.id] = depth + 1;
      }
    }

    endTarget.copy(t.closestPoint);
    return t.closestNode;
  }


  /**
   * Returns a path between given start and end points. If a complete path
   * cannot be found, will return the nearest endpoint available.
   *
   * @param  {Geom.VectJson} startPosition Start position.
   * @param  {Geom.VectJson} targetPosition Destination.
   * @param  {string} zoneID ID of current zone.
   * @param  {number} groupID Current group ID.
   */
  findPath (startPosition, targetPosition, zoneID, groupID) {
    const nodes = this.zones[zoneID].groups[groupID];
    const vertices = this.zones[zoneID].vertices;

    const closestNode = this.getClosestNode(startPosition, zoneID, groupID);
    const farthestNode = this.getClosestNode(targetPosition, zoneID, groupID);

    if (!closestNode || !farthestNode) {
      return null; // We can't find any node
    }

    const nodePath = /** @type {Nav.GraphNode[]} */ (AStar.search(
      /** @type {Nav.Graph} */ (nodes),
      closestNode,
      farthestNode
    ));

    // We have the corridor, now pull the rope
    const channel = new Channel;
    channel.push(startPosition);
    for (let i = 0; i < nodePath.length; i++) {
      const polygon = nodePath[i];
      const nextPolygon = nodePath[i + 1];

      if (nextPolygon) {
        const portals = /** @type {number[]} */ (this.getPortalFromTo(polygon, nextPolygon));
        channel.push(
          vertices[portals[0]],
          vertices[portals[1]]
        );
      }
    }
    channel.push(targetPosition);
    channel.stringPull();

    const path = (/** @type {Geom.VectJson[]} */ (channel.path)).map(Vect.from);
    
    // Omit 1st point and discard adjacent repetitions
    const normalised = path.slice(1).reduce((agg, p) => {
      return agg.length && p.equals(agg[agg.length - 1])
        ? agg
        : agg.concat(p)
    }, /** @type {Geom.Vect[]} */ ([]));

    return { path: normalised, nodePath };
  }

  /**
   * Builds a zone/node set from navigation mesh geometry.
   * @param  {Geom.TriangulationJson} tr
   * @return {Nav.Zone}
   */
  static createZone (tr) {
    return Builder.buildZone(tr);
  }

  /**
   * Returns a random node within a given range of a given position.
   * @param  {string} zoneID
   * @param  {number} groupID
   * @param  {Vect} nearPosition
   * @param  {number} nearRange
   */
  getRandomNode (zoneID, groupID, nearPosition, nearRange) {

    if (!this.zones[zoneID]) return new Vect(0, 0);

    nearPosition = nearPosition || null;
    nearRange = nearRange || 0;

    const candidates = /** @type {Vect[]} */ ([]);
    const polygons = this.zones[zoneID].groups[groupID];

    polygons.forEach((p) => {
      if (nearPosition && nearRange) {
        if (Utils.distanceToSquared(nearPosition, p.centroid) < nearRange * nearRange) {
          candidates.push(p.centroid);
        }
      } else {
        candidates.push(p.centroid);
      }
    });

    return Utils.sample(candidates) || new Vect(0, 0);
  }

  /**
   * Returns the closest node to the target position.
   * @param  {Geom.VectJson} position
   * @param  {string}  zoneID
   * @param  {number}  groupID
   */
  getClosestNode (position, zoneID, groupID) {
    const nodes = this.zones[zoneID].groups[groupID];
    const vertices = this.zones[zoneID].vertices;
    let closestNode = /** @type {null | Nav.GraphNode} */ (null);
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const distance = Utils.distanceToSquared(node.centroid, position);
      if (distance < closestDistance && Utils.isVectorInPolygon(position, node, vertices)) {
        closestNode = node;
        closestDistance = distance;
      }
    });

    if (!closestNode) {// Fallback to centroids (possibly initial zig-zag)
      nodes.forEach((node) => {
        const distance = Utils.distanceToSquared(node.centroid, position);
        if (distance < closestDistance) {
          closestNode = node;
          closestDistance = distance;
        }
      });
    }

    return /** @type {Nav.GraphNode} */ (closestNode);
  }

  /**
   * @private
   * @param {Nav.GraphNode} a 
   * @param {Nav.GraphNode} b
   */
  getPortalFromTo(a, b) {
    for (let i = 0; i < a.neighbours.length; i++) {
      if (a.neighbours[i] === b.id) {
        return a.portals[i];
      }
    }
  }

  /**
   * Returns node group ID containing given position, or null.
   * @param  {string} zoneID
   * @param  {Geom.VectJson} position
   */
  getGroup(zoneID, position) {
    if (!this.zones[zoneID]) return null;
    const zone = this.zones[zoneID];

    for (let i = 0; i < zone.groups.length; i++) {
      const group = zone.groups[i];
      for (const node of group) {
        const poly = [
          zone.vertices[node.vertexIds[0]],
          zone.vertices[node.vertexIds[1]],
          zone.vertices[node.vertexIds[2]],
        ];

        if (Utils.isPointInPoly(poly, position)) return i;
      }
    }
    return null;
  }

  /**
   * Sets data for the given zone.
   * @param {string} zoneID
   * @param {Nav.Zone} zone
   */
  setZoneData (zoneID, zone) {
    this.zones[zoneID] = zone;
  }
}

/** Singleton service */
export const pathfinding = new Pathfinding
