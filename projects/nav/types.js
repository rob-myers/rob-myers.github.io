import { Vect } from '../geom';

/**
 * @typedef GraphNode @type {object}
 * @property {number} id
 * @property {number[]} neighbours
 * @property {number} f
 * @property {number} g
 * @property {number} h
 * @property {number} cost
 * @property {boolean} visited
 * @property {boolean} closed
 * @property {null | GraphNode} parent
 * @property {number[][]} portals
 * @property {number[]} vertexIds
 * @property {Vect} centroid
 */

/** @typedef {GraphNode[]} Graph */

/**
 * @typedef NavPoly @type {object}
 * @property {number[]} vertexIds
 * @property {Set<NavPoly>} neighbours
 * @property {Vect} centroid
 * @property {number=} group
 */

/**
 * @typedef Zone @type {object}
 * @property {Vect[]} vertices
 * @property {GraphNode[][]} groups
 */

/**
 * @typedef Group @type {object}
 * @property {number} id
 * @property {number[]} neighbours
 * @property {number[]} vertexIds
 * @property {Vect} centroid
 * @property {any[]} portals
 */