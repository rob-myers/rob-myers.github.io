declare module 'triangle-wasm' {

  export interface Triangle {
    init(
      /** Path to triangle.out.wasm, default is `/` */
      path?: string,
    ): Promise<void>;
    
    makeIO(
      data?: TriangulateIO,
    ): TriangulateIO;

    triangulate(
      switches: Switches,
      input: TriangulateIO,
      output: TriangulateIO,
      vorout?: TriangulateIO,
    );

    freeIO(
      io: TriangulateIO,
      all?: boolean,
    );
  }

  export interface Switches {
    /** Read input as a Planar Straight Line Graph. (default `true`) */
    pslg?: boolean;
    /**
     * Quality mesh generation by Delaunay refinement.
     * Adds vertices to the mesh to ensure that all angles are between 20 and 140 degrees.
     * A minimum angle can be set by passing a number. Guaranteed to terminate for 28.6 degrees or smaller. Often succeeds up to 34 degrees.
     */
    quality?: boolean | number;
    /**
     * Imposes a maximum triangle area.
     * A maximum area can be set by passing a number.
     * If true reads maximum area from the input (i.e. a .poly file)
     */
    area?: boolean | number;
    /**
     * Conforming constrained Delaunay triangulation
     */
    ccdt?: boolean;
    /** Refine a previously generated mesh. */
    refine?: boolean;
    /**
     * Create segments on the convex hull of the triangulation.
     * Beware: if you are not careful, this switch can cause the introduction of an extremely thin angle between a PSLG segment and a convex hull segment, which can cause overrefinement (and possibly failure if Triangle runs out of precision).
     */
    convexHull?: boolean;
    /**
     * Prevent duplicated input vertices, or vertices 'eaten' by holes, from appearing in the output. If any vertices are jettisoned, the vertex numbering in the output differs from that of the input.
     */
    jettison?: boolean;
    /**
     * Output a list of edges of the triangulation.
     */
    edges?: boolean;
    /**
     * Output a list of triangles neighboring each triangle.
     */
    neighbors?: boolean;
    /**
     * Generate second-order subparametric elements with six nodes each.
     */
    quadratic?: boolean;
    /**
     * Assign an additional floating-point attribute to each triangle that identifies what segment-bounded region each triangle belongs to.
     */
    regionAttr?: boolean;
    /**
     * Output boundary markers. (default true).
     * Attention: -B works the other way around, if present it suppresses boundary markers.
     */
    bndMarkers?: boolean;
    /**
     * Read holes from the input. (default true)
     * Attention: -O works the other way around, if present it ignores holes.
     */
    holes?: boolean;
    /**
     * Maximum number of Steiner points - vertices that are not in the input, but are added to meet the constraints on minimum angle and maximum area. (default unlimited)
     */
    steiner?: number;
    /**
     * Suppress all explanation of what Triangle is doing, unless an error occurs. (default true)
     */
    quiet?: boolean;
  }

  export interface TriangulateIO {
    /** Flattened 2d coords */
    pointlist: number[];
    /** ? */
    pointattributelist?: any[];
    /** An array of point markers, one per point. */
    pointmarkerlist?: number[]; 
    /** An array of triangle corners, 3 ints per triangle. */
    trianglelist?: number[];
    /** An array of triangle attributes. */
    triangleattributelist?: any[];
    /** An array of triangle area constraints. Input only. 1 float per triangle. */
    trianglearealist?: number[];
    /** An array of triangle neighbors. Output only. 3 ints per triangle. */
    neighborlist?: number[];
    /** An array of segment endpoints. 2 ints per segment. */
    segmentlist?: number[];
    /** An array of segment markers. 1 int per segment. */
    segmentmarkerlist?: number[];
    /** An array of holes. Input only, copied to output. 2 floats per hole. */
    holelist?: number[];
    /** An array of regional attributes and area constraints. Input only, copied to output. 4 floats per region. */
    regionlist?: number[];
    /** An array of edge endpoints. Output only. 2 ints per edge. */
    edgelist?: number[];
    /** An array of edge markers. Output only. 1 int per edge. */
    edgemarkerlist?: number[];
    /** An array of normal vectors, used for infinite rays in Voronoi diagrams. Output only. 2 floats per vector. */
    normlist?: number[];
    /** Number of points. */
    numberofpoints?: number;
    /** Number of point attributes. */
    numberofpointattributes?: number;
    /** Number of triangles. */
    numberoftriangles?: number;
    /** Number of triangle corners. */
    numberofcorners?: number;
    /** Number of triangle attributes. */
    numberoftriangleattributes?: number;
    /** Number of segments. */
    numberofsegments?: number;
    /** Number of holes. Input only, copied to output. */
    numberofregions?: number;
    /** Number of regions. Input only, copied to output. */
    numberofholes?: number;
    /** Number of edges. Output only. */
    numberofedges?: number;
  }

  const triangle: Triangle;

  export = triangle; 
}
