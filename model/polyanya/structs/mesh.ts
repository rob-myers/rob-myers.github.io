import { testNever, last as lastEl } from "../../generic.model";
import Vertex from "./vertex";
import Polygon from "./polygon";
import Point from "./point";
import { EPSILON } from "./consts";

enum PolyContainmentType {
    // Does not use any ints.
    OUTSIDE,
    // Does not use any ints.
    INSIDE,
    // Uses adjacent_poly, vertex1 and vertex2.
    ON_EDGE,
    // Uses vertex1.
    ON_VERTEX,
};

export class PolyContainment {

  constructor(
    public type: PolyContainmentType,
    public adjacent_poly: number,
    // If on edge, vertex1/vertex2 represents the left/right vertices of the
    // edge when looking from a point in the poly.
    public vertex1: number,
    public vertex2: number,
  ) {}

  toString(): string {
    switch (this.type) {
      case PolyContainmentType.OUTSIDE:
        return 'OUTSIDE';
      case PolyContainmentType.INSIDE:
        return 'INSIDE';
      case PolyContainmentType.ON_EDGE:
        return `ON_EDGE (poly ${this.adjacent_poly}, vertices ${this.vertex1}, ${this.vertex2})`;
      case PolyContainmentType.ON_VERTEX:
        return `ON_VERTEX (${this.vertex1})`;
      default:
        throw testNever(this.type);
    }
  }
};

export enum PointLocationType {
  // Does not use any ints.
  NOT_ON_MESH,
  // Uses poly1 (the polygon it is on).
  IN_POLYGON,
  // Uses poly1 (the polygon it is on) and both vertices.
  ON_MESH_BORDER,       // edge: a polygon is not traversable
  // Uses poly1, poly2 and both vertices.
  ON_EDGE,              // edge: both polygons are traversable
  // Uses vertex1.
  // Can use poly1 to specify the "grid corrected poly".
  // Will need to manually assign poly1, though.
  ON_CORNER_VERTEX_AMBIG,   // vertex; two+ polygons are not traversable
  // Uses vertex1. Also returns an arbirary traversable adjacent
  // polygon in poly1.
  ON_CORNER_VERTEX_UNAMBIG, // vertex; one polygon is not traversable
  // Uses vertex1. Also returns an arbitrary adjacent polygon in poly1.
  ON_NON_CORNER_VERTEX, // vertex: all polygons are traversable
};

class PointLocation {

  constructor(
    public type: PointLocationType,
    public poly1: number,
    public poly2: number,
    // If on edge, vertex1/vertex2 represents the left/right vertices of the
    // edge when looking from a point in poly1.
    public vertex1: number,
    public vertex2: number,
  ) {}

  public toString() {
    switch (this.type) {
      case PointLocationType.NOT_ON_MESH:
        return 'NOT_ON_MESH';
      case PointLocationType.IN_POLYGON:
        return `IN_POLYGON (${this.poly1})`;
      case PointLocationType.ON_MESH_BORDER:
        return `ON_MESH_BORDER (poly ${this.poly1}, vertices ${this.vertex1}, ${this.vertex2})`;
      case PointLocationType.ON_EDGE:
        return `ON_EDGE (polys ${this.poly1}, ${this.poly2}, vertices ${this.vertex1}, ${this.vertex2});`;
      case PointLocationType.ON_CORNER_VERTEX_AMBIG:
        return `ON_CORNER_VERTEX_AMBIG (${this.vertex1}, poly? ${this.poly1})`;
      case PointLocationType.ON_CORNER_VERTEX_UNAMBIG:
        return `ON_CORNER_VERTEX_UNAMBIG (${this.vertex1}, poly ${this.poly1})`;
      case PointLocationType.ON_NON_CORNER_VERTEX:
        return `ON_NON_CORNER_VERTEX (${this.vertex1}, poly ${this.poly1})`;
      default:
        throw testNever(this.type);
    }
  }

  public equals(other: PointLocation) {
    if (this.type != other.type) {
      return false;
    }

    switch (this.type) {
      case PointLocationType.NOT_ON_MESH:
        return true;
      case PointLocationType.IN_POLYGON:
        return this.poly1 == other.poly1;
      case PointLocationType.ON_MESH_BORDER:
        if (this.poly1 != other.poly1) {
          return false;
        }
        if (this.vertex1 == other.vertex1 && this.vertex2 == other.vertex2) {
          return true;
        }
        if (this.vertex1 == other.vertex2 && this.vertex2 == other.vertex1) {
          return true;
        }
        return false;
      case PointLocationType.ON_EDGE:
        if (
          this.poly1 == other.poly1 && this.poly2 == other.poly2
          && this.vertex1 == other.vertex1 && this.vertex2 == other.vertex2
        ) {
          return true;
        }
        if (
          this.poly1 == other.poly2 && this.poly2 == other.poly1
          && this.vertex1 == other.vertex2 && this.vertex2 == other.vertex1
        ) {
          return true;
        }
        return false;
      case PointLocationType.ON_CORNER_VERTEX_AMBIG:
      case PointLocationType.ON_CORNER_VERTEX_UNAMBIG:
      case PointLocationType.ON_NON_CORNER_VERTEX:
        return this.vertex1 == other.vertex1;
      default:
        throw testNever(this.type);
    }
  }

  public notEquals(other: PointLocation) {
    return !(this.equals(other));
  }

}

/** Index of first key `k` not smaller than `key`. */
function lowerBoundIndex<K extends number, V>(map: Map<K, V>, key: K): number | null {
  let i = 0;
  for (const k of map.keys()) {
    if (k >= key) return i;
    i++;
  }
  return null;
}
/** Index of first key `k` greater than `key`. */
function upperBoundIndex<K extends number, V>(map: Map<K, V>, key: K): number | null {
  let i = 0;
  for (const k of map.keys()) {
    if (k > key) return i;
    i++;
  }
  return null;
}
function upperBound<K extends number, V>(map: Map<K, V>, key: K): K | null {
  for (const k of map.keys()) {
    if (k > key) return k;
  }
  return null;
}

export default class Mesh {

  private slabs!: Map<number, number[]>;
  private min_x = Number.MAX_SAFE_INTEGER;
  private min_y = Number.MAX_SAFE_INTEGER;
  private max_x = Number.MIN_SAFE_INTEGER;
  private max_y = Number.MIN_SAFE_INTEGER;
  
  mesh_vertices: Vertex[];
  mesh_polygons: Polygon[];
  max_poly_sides: number;

  constructor({ vertices, polygons, vertexToPolys}: MeshJson) {
    this.max_poly_sides = 0;

    this.mesh_vertices = vertices.map(([x, y], i) => new Vertex(
      new Point(x, y),
      vertexToPolys[i],
      vertexToPolys[i].some(x => x === -1),
      vertexToPolys[i].filter(x => x === -1).length > 1,
    ));

    this.mesh_polygons = polygons.map(({ vertexIds, adjPolyIds }) => {
      let min = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
      let max = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
      vertexIds.map(i => this.mesh_vertices[i]).forEach(({ p }) => {
        min = [Math.min(min[0], p.x), Math.min(min[1], p.y)];
        max = [Math.max(max[0], p.x), Math.max(max[1], p.y)];
      });

      // Adjust global mesh bounds
      [this.min_x, this.min_y] = [Math.min(this.min_x, min[0]), Math.min(this.min_y, min[1])];
      [this.max_x, this.max_y] = [Math.max(this.max_x, max[0]), Math.max(this.max_y, max[1])];
      this.max_poly_sides = Math.max(this.max_poly_sides, vertexIds.length);

      return new Polygon(
        vertexIds,
        adjPolyIds,
        min[0],
        max[0],
        min[1],
        max[1],
        adjPolyIds.filter(x => x !== -1).length <= 1,
      );
    });

    this.precalc_point_location();
  }

  precalc_point_location() {
    // Ensure iterator `this.slabs` is aligned to key-ordering
    const pairs = this.mesh_vertices.map(v => [v.p.x, []] as [number, number[]]);
    pairs.sort((a, b) => a[0] < b[0] ? -1 : 1);
    this.slabs = new Map(pairs);
    
    for (const [i, p] of this.mesh_polygons.entries()) {
      const lowJ = lowerBoundIndex(this.slabs, p.min_x)!;
      const highJ = upperBoundIndex(this.slabs, p.max_x)??(this.slabs.size - 1);
      let j = -1;
      this.slabs.forEach((slab) => lowJ <= ++j && j <= highJ && slab.push(i));
    }
    for (const [, inner] of this.slabs) {
      inner.sort((a: number, b: number) => {
        // Sorts based on the midpoints.
        // If tied, sort based on width of poly.
        const ap = this.mesh_polygons[a];
        const bp = this.mesh_polygons[b];
        const as = ap.min_y + ap.max_y;
        const bs = bp.min_y + ap.max_y;
        return as === bs
          ? (ap.max_y - ap.min_y) > (bp.max_y - bp.min_y) ? -1 : 1
          : as < bs ? -1 : 1;
      });
    }
  }
  
  // PointLocation get_point_location(Point& p);
  // Finds where the point P lies in the mesh.
  get_point_location(p: Point) {
    if (
      p.x < this.min_x - EPSILON
      || p.x > this.max_x + EPSILON
      || p.y < this.min_y - EPSILON
      || p.y > this.max_y + EPSILON
    ) {
      return new PointLocation(PointLocationType.NOT_ON_MESH, -1, -1, -1, -1);
    }

    // Check if the 1st key above p.x is the least key (we previously sorted keys)
    let slabKey = upperBound(this.slabs, p.x)!;
    if (slabKey === this.slabs.keys().next().value) {
      return new PointLocation(PointLocationType.NOT_ON_MESH, -1, -1, -1, -1);
    }

    // Find previous slab key
    slabKey = [...this.slabs.keys()].find((_, i, keys) => keys[i + 1] === slabKey)!;
    const polys = this.slabs.get(slabKey)!;
    
    let closeIndex = polys.findIndex(x => {
      // Sorts based on the midpoints.
      // If tied, sort based on width of poly.
      const poly = this.mesh_polygons[x];
      return !(poly.min_y + poly.max_y < p.y * 2);
    });
    closeIndex === -1 && (closeIndex = polys.length - 1);

    // The plan is to take an index and repeatedly do:
    // +1, -2, +3, -4, +5, -6, +7, -8, ...
    // until it hits the edge. If it hits an edge, instead iterate normally.
    const ps = polys.length;
    let i = closeIndex;
    let next_delta = 1;
    let walk_delta = 0; // way to go when walking normally
    
    // console.log({ i, ps });
    while (i >= 0 && i < ps) {
      const polygon = polys[i];
      const result = this.poly_contains_point(polygon, p);
      // console.log({ polygon, p, result });
      
      switch (result.type) {
        case PolyContainmentType.OUTSIDE:
          // Does not contain: try the next one.
          break;
        case PolyContainmentType.INSIDE:
          // This one strictly contains the point.
          return new PointLocation(PointLocationType.IN_POLYGON, polygon, -1, -1, -1);
        case PolyContainmentType.ON_EDGE:
          // This one lies on the edge.
          // Chek whether the other one is -1.
          return new PointLocation(
            result.adjacent_poly === -1
              ? PointLocationType.ON_MESH_BORDER
              : PointLocationType.ON_EDGE,
            polygon,
            result.adjacent_poly,
            result.vertex1,
            result.vertex2,
          );
        case PolyContainmentType.ON_VERTEX: {
          // This one lies on a corner.
          const v = this.mesh_vertices[result.vertex1];
          if (v.is_corner) {
            if (v.is_ambig) {
              return new PointLocation(PointLocationType.ON_CORNER_VERTEX_AMBIG, -1, -1,
                result.vertex1, -1);
            } else {
              return new PointLocation(PointLocationType.ON_CORNER_VERTEX_UNAMBIG,
                polygon, -1, result.vertex1, -1);
            }
          } else {
            return new PointLocation(
              PointLocationType.ON_NON_CORNER_VERTEX,
              polygon, -1,
              result.vertex1, -1);
          }
        }

        default:
          // This should not be reachable
          throw testNever(result.type);
      }

      // do stuff
      if (walk_delta == 0) {
        const next_i = i + next_delta * (2 * (next_delta & 1) - 1);
        if (next_i < 0) {
          // was going to go too far to the left.
          // start going right
          walk_delta = 1;
        } else if (next_i >= ps) {
          walk_delta = -1;
        } else {
          i = next_i;
          next_delta++;
        }
      }

      if (walk_delta != 0) {
        i += walk_delta;
      }
    }

    // Haven't returned yet, therefore P does not lie on the mesh.
    return new PointLocation(PointLocationType.NOT_ON_MESH, -1, -1, -1, -1);
  }
  
  // PointLocation get_point_location_naive(Point& p);
  get_point_location_naive(p: Point): PointLocation {
    for (let polygon = 0; polygon < this.mesh_polygons.length; polygon++) {
      const result = this.poly_contains_point(polygon, p);
      switch (result.type) {
        case PolyContainmentType.OUTSIDE:
          // Does not contain: try the next one.
          break;
        case PolyContainmentType.INSIDE:
          // This one strictly contains the point.
          return new PointLocation(PointLocationType.IN_POLYGON, polygon, -1, -1, -1);
        case PolyContainmentType.ON_EDGE:
          // This one lies on the edge.
          // Chek whether the other one is -1.
          return new PointLocation(
            (result.adjacent_poly == -1
              ? PointLocationType.ON_MESH_BORDER
              : PointLocationType.ON_EDGE),
            polygon, result.adjacent_poly,
            result.vertex1, result.vertex2
          );
        case PolyContainmentType.ON_VERTEX: {
          // This one lies on a corner.
          const v = this.mesh_vertices[result.vertex1];
          if (v.is_corner) {
            if (v.is_ambig) {
              return new PointLocation(
                PointLocationType.ON_CORNER_VERTEX_AMBIG, -1, -1, result.vertex1, -1,
              );
            } else {
              return new PointLocation(
                PointLocationType.ON_CORNER_VERTEX_UNAMBIG, polygon, -1, result.vertex1, -1,
              );
            }
          } else {
            return new PointLocation(
              PointLocationType.ON_NON_CORNER_VERTEX, polygon, -1, result.vertex1, -1,
            );
          }
        }
        default:
          throw testNever(result.type);
      }
    }
    // Haven't returned yet, therefore P does not lie on the mesh.
    return new PointLocation(PointLocationType.NOT_ON_MESH, -1, -1, -1, -1);
  }
  
  // PolyContainment poly_contains_point(int poly, Point& p);
  // Finds out whether the polygon specified by "poly" contains point P.
  poly_contains_point(poly: number, p: Point): PolyContainment {
    // The below is taken from
    // "An Efficient Test for a Point to Be in a Convex Polygon"
    // from the Wolfram Demonstrations Project
    // demonstrations.wolfram.com/AnEfficientTestForAPointToBeInAConvexPolygon/

    // Assume points are in counterclockwise order.
    const poly_ref = this.mesh_polygons[poly];
    if (
      p.x < poly_ref.min_x - EPSILON
      || p.x > poly_ref.max_x + EPSILON
      || p.y < poly_ref.min_y - EPSILON
      || p.y > poly_ref.max_y + EPSILON
    ) {
      return new PolyContainment(PolyContainmentType.OUTSIDE, -1, -1, -1);
    }
    const last_point_in_poly = this.mesh_vertices[lastEl(poly_ref.vertices)!].p;
    const ZERO = new Point(0, 0);

    let last = last_point_in_poly.sub(p);
    if (last.equals(ZERO)) {
      return new PolyContainment(PolyContainmentType.ON_VERTEX, -1, lastEl(poly_ref.vertices)!, -1);
    }

    let last_index = lastEl(poly_ref.vertices)!;
    for (let i = 0; i < poly_ref.vertices.length; i++) {
      const point_index = poly_ref.vertices[i];
      const cur = this.mesh_vertices[point_index].p.sub(p);
      if (cur.equals(ZERO)) {
        return new PolyContainment(PolyContainmentType.ON_VERTEX, -1, point_index, -1);
      }
      const cur_a = last.cross(cur);
      if (Math.abs(cur_a) < EPSILON) {
        // The line going from cur to last goes through p.
        // This means that they are collinear.
        // The associated polygon should simply be polygons[i] in version
        // 2 of the file format.

        // Ensure that cur = c*last where c is negative.
        // If not, this means that the point is either outside or that this
        // segment is collinear to an adjacent one.
        if (cur.x) {
          if (!((cur.x > 0) !== (last.x > 0))) {
            last = cur;
            last_index = point_index;
            continue;
          }
        } else {
          if (!((cur.y > 0) !== (last.y > 0))) {
            last = cur;
            last_index = point_index;
            continue;
          }
        }
        return new PolyContainment(
          PolyContainmentType.ON_EDGE, poly_ref.polygons[i], point_index, last_index,
        );
      }

      // Because we assume that the points are counterclockwise,
      // we can immediately terminate when we see a negatively signed area.
      if (cur_a < 0) {
        return new PolyContainment(
          PolyContainmentType.OUTSIDE, -1, -1, -1);
      }
      last = cur;
      last_index = point_index;
    }
    return new PolyContainment(PolyContainmentType.INSIDE, -1, -1, -1);
  }

  // void print(std::ostream& outfile);
  print() {
    return `mesh with ${
      this.mesh_vertices.length} vertices, ${this.mesh_polygons} polygons\n` +
    `vertices:\n${
      this.mesh_vertices.map(x => `${x.p} ${x.is_corner}\n`).join(' ')}` +
    `polygons:\n${
      this.mesh_polygons
        .flatMap(x => x.vertices.map(i => this.mesh_vertices[i].p))
        .join(' ')
    }\n`;
  }

  // void print_polygon(std::ostream& outfile, int index);
  print_polygon(index: number) {
    if (index == -1) {
      return "P!!!";
    }
    return `P ${index} [${
      this.mesh_polygons[index].vertices
        .map(v => this.print_vertex(v))
        .join(', ')
    }]`;
  }
  
  // void print_vertex(std::ostream& outfile, int index);
  print_vertex(index: number) {
    return `V${index} ${this.mesh_vertices[index].p}`;
  }

}

export interface MeshJson {
  vertices: [number, number][];
  polygons: {
    /** Each convex polygon is represented as vertex indices. */
    vertexIds: number[];
    /** Ids of adjacent polygons or `-1` if none */
    adjPolyIds: number[];
  }[];
  /**
   * i^th entry are ids of polygons adjacent to i^th vertex.
   * Permit `-1` if vertex on edge which borders exterior.
   * Multiple `-1`'s means the vertex is 'ambiguous'.
   */
  vertexToPolys: number[][];
}
