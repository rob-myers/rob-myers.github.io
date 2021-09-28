export class MeshBVHNode {

  constructor() {
		// internal nodes have boundingData, left, right, and splitAxis
		// leaf nodes have offset and count (referring to primitives in the mesh geometry)

    /** @type {Float32Array} */
    this.boundingData;
    /** @type {number} */
    this.splitAxis;

    /** @type {MeshBVHNode=} */
    this.left;
    /** @type {MeshBVHNode=} */
    this.right;

    /** @type {number=} */
    this.offset;
    /** @type {number=} */
    this.count;

	}

}