declare namespace MeshBvh {

  export interface Options {
    /**
     * Which split strategy to use when constructing the BVH.
     * - Default is `CENTER`.
     */
    strategy: 'CENTER' | 'AVERAGE' | 'SAH';

    /**
     * The maximum depth to allow the tree to build to.
     * - Default is `40`.
     * - Setting this to a smaller trades raycast speed for better construction time and less memory allocation.
     */
    maxDepth: number;

    /**
     * The number of triangles to aim for in a leaf node.
     * - Default is `10`.
     * - Setting this to a lower number can improve raycast performance but increase construction time and memory footprint.
     */
    maxLeafTris: number;

    /**
     * If true then the bounding box for the geometry is set once the BVH has been constructed.
     * - Default is `true`
     */
    setBoundingBox: boolean;

    /**
     * If true then the MeshBVH will use SharedArrayBuffer rather than ArrayBuffer when initializing the BVH buffers.
     * Geometry index data will be created as a SharedArrayBuffer only if it needs to be created. Otherwise it is used as-is.
     * - Default is `false`.
     */
    useSharedArrayBuffer: boolean;

    /**
     * Print out warnings encountered during tree construction.
     * - Default is `true`.
     */
    verbose: boolean;
  }

  export interface Geometry {
    t: Geom.Triangulation;

    /** Derived from triangulation */
    attributes: {
      position: {
        /** Number of vectors */
        count: number;
        /** [x1,y1, x2,y2, ...] */
        array: number[];

        isInterleavedBufferAttribute: false;
        offset: null;
        data: any;
      };
    };
    isBufferGeometry: true;
    /** Should be empty */
    groups: any[];

    index: {
      /** Populated by algorithm */
      array: Uint16Array | Uint32Array;
      count: number;
      isInterleavedBufferAttribute: false;
    };
  }

}