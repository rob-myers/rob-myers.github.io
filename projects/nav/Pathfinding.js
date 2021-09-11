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
		this.zones = ({});

		const temp = {
			point: new Vect(0, 0),
			triangle: new Triangle,
			endPoint: new Vect(0, 0),
			closestNode: /** @type {null | Nav.GraphNode} */ (null),
			closestPoint: new Vect(0, 0),
			closestDistance: Infinity,
		};
		/** @type {typeof temp} */
		this.temp = temp;
	}

	/**
	 * (Static) Builds a zone/node set from navigation mesh geometry.
	 * @param  {Geom.Triangulation} tr
	 * @return {Nav.Zone}
	 */
	static createZone (tr) {
		return Builder.buildZone(tr);
	}

	/**
	 * Sets data for the given zone.
	 * @param {string} zoneID
	 * @param {Nav.Zone} zone
	 */
	setZoneData (zoneID, zone) {
		this.zones[zoneID] = zone;
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
	 * @param  {Vect} position
	 * @param  {string}  zoneID
	 * @param  {number}  groupID
	 * @param  {boolean} checkPolygon
	 */
	getClosestNode (position, zoneID, groupID, checkPolygon = false) {
		const nodes = this.zones[zoneID].groups[groupID];
		const vertices = this.zones[zoneID].vertices;
		let closestNode = /** @type {null | Nav.GraphNode} */ (null);
		let closestDistance = Infinity;

		nodes.forEach((node) => {
			const distance = Utils.distanceToSquared(node.centroid, position);
			if (distance < closestDistance
					&& (!checkPolygon || Utils.isVectorInPolygon(position, node, vertices))) {
				closestNode = node;
				closestDistance = distance;
			}
		});

		return /** @type {Nav.GraphNode} */ (closestNode);
	}

	/**
	 * Returns a path between given start and end points. If a complete path
	 * cannot be found, will return the nearest endpoint available.
	 *
	 * @param  {Vect} startPosition Start position.
	 * @param  {Vect} targetPosition Destination.
	 * @param  {string} zoneID ID of current zone.
	 * @param  {number} groupID Current group ID.
	 */
	findPath (startPosition, targetPosition, zoneID, groupID) {
		const nodes = this.zones[zoneID].groups[groupID];
		const vertices = this.zones[zoneID].vertices;

		const closestNode = this.getClosestNode(startPosition, zoneID, groupID, true);
		const farthestNode = this.getClosestNode(targetPosition, zoneID, groupID, true);

		// If we can't find any node, just go straight to the target
		if (!closestNode || !farthestNode) {
			return null;
		}

		const paths = AStar.search(
      /** @type {Nav.Graph} */ (nodes),
      closestNode,
      farthestNode
    );

		/**
		 * @param {Nav.GraphNode} a 
		 * @param {Nav.GraphNode} b
		 */
		const getPortalFromTo = function (a, b) {
			for (let i = 0; i < a.neighbours.length; i++) {
				if (a.neighbours[i] === b.id) {
					return a.portals[i];
				}
			}
		};

		// We have the corridor, now pull the rope.
		const channel = new Channel;
		channel.push(startPosition);
		for (let i = 0; i < paths.length; i++) {
			const polygon = paths[i];
			const nextPolygon = paths[i + 1];

			if (nextPolygon) {
				/** @type {number[]} */
				const portals = (getPortalFromTo(polygon, nextPolygon));
				channel.push(
					vertices[portals[0]],
					vertices[portals[1]]
				);
			}
		}
		channel.push(targetPosition);
		channel.stringPull();

		// Return the path, omitting first position (which is already known).
		const path = (/** @type {Vect[]} */ (channel.path))
			.map((c) => new Vect(c.x, c.y));
		path.shift();
		return path;
	}

	/**
	 * Returns closest node group ID for given position.
	 * @param  {string} zoneID
	 * @param  {Vect} position
	 */
	getGroup(zoneID, position, checkPolygon = false) {
		if (!this.zones[zoneID]) return null;

		/** @type {null | number} */
		let closestNodeGroup = null;
		let distance = Math.pow(50, 2);
		const zone = this.zones[zoneID];

		for (let i = 0; i < zone.groups.length; i++) {
			const group = zone.groups[i];
			for (const node of group) {
				if (checkPolygon) {
					const poly = [
						zone.vertices[node.vertexIds[0]],
						zone.vertices[node.vertexIds[1]],
						zone.vertices[node.vertexIds[2]],
					];
					if(Utils.isPointInPoly(poly, position)) return i;
				}
				const measuredDistance = Utils.distanceToSquared(node.centroid, position);
				if (measuredDistance < distance) {
					closestNodeGroup = i;
					distance = measuredDistance;
				}
			}
		}

		return closestNodeGroup;
	}

	/**
	 * Clamps a step along the navmesh, given start and desired endpoint. May be
	 * used to constrain first-person / WASD controls.
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
				const neighbour = nodes[currentNode.neighbours[i]];
				if (neighbour.id in nodeDepth) continue;

				nodeQueue.push(neighbour);
				nodeDepth[neighbour.id] = depth + 1;
			}
		}

		endTarget.copy(t.closestPoint);
		return t.closestNode;
	}
}