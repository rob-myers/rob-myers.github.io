import { testNever, last as lastEl } from '../../generic.model';
import { ZeroOnePos, line_intersect_bound_check, reflect_point, get_orientation, OrientationType, is_collinear, line_intersect } from '../helpers/geometry';
import Point from '../structs/point'
import { EPSILON } from '../structs/consts';
import SearchNode from '../structs/search-node';
import Mesh from '../structs/mesh';
import Successor, { SuccessorType } from '../structs/successor';
import Vertex from '../structs/vertex';

/**
 * Gets the h value of a search node with interval l-r
 * and root "root", given a goal.
 */
export function get_h_value(
  root: Point,
  goal: Point,
  l: Point,
  r: Point,
) {
  if (root == l || root == r) {
    return root.distance(goal);
  }
  // First, check whether goal and root are on the same side of the interval.
  // If either are collinear with r/l, reflecting does nothing.
  const lr = r.sub(l);
  const lroot = root.sub(l);
  let lgoal = goal.sub(l);
  if ((lroot.cross(lr) > 0) === (lgoal.cross(lr) > 0)) {
    // Need to reflect.
    goal = reflect_point(goal, l, r);
    lgoal = goal.sub(l);
  }
  // Now we do the actual line intersection test.
  const denom = (goal.sub(root)).cross(lr);
  if (Math.abs(denom) < EPSILON) {
    // Root, goal, L and R are ALL collinear!
    // Take the best one of root-L-goal and root-R-goal.

    // We can be sneaky and use the distance squared as we always want the
    // endpoint which is closest to the root.
    const root_l = root.distance_sq(l);
    const root_r = root.distance_sq(r);

    // If they're the same or within an epsilon we don't care which one we
    // use.

    if (root_l < root_r) {
      // L is better.
      return Math.sqrt(root_l) + l.distance(goal);
    } else {
      // R is better.
      return Math.sqrt(root_r) + r.distance(goal);
    }
  }
  const lr_num = lgoal.cross(lroot);
  const lr_pos = line_intersect_bound_check(lr_num, denom);
  switch (lr_pos) {
    case ZeroOnePos.LT_ZERO:
    // Too far left.
    // Use left end point.
    return root.distance(l) + l.distance(goal);

    case ZeroOnePos.EQ_ZERO:
    case ZeroOnePos.IN_RANGE:
    case ZeroOnePos.EQ_ONE:
    // Line goes through interval, so just use the direct distance.
    return root.distance(goal);

    case ZeroOnePos.GT_ONE:
    // Too far right.
    // Use right end point.
    return root.distance(r) + r.distance(goal);

    default:
    // Unreachable.
      throw testNever(lr_pos);
      // return -1;
  }
}

/**
 * All indices must be within the range [0, 2 * N - 1] to make binary search
 * easier. You can normalise an index with this macro:
 */
const normalise = (index: number, N: number) => (index) - ((index) >= N ? N : 0);

// Internal binary search helper.
// Assume that there exists at least one element within the range which
// satisifies the predicate.
function binary_search<T, Pred extends (item: T) => boolean>(
  arr: number[],
  N: number,
  objects: T[],
  lower: number,
  upper: number,
  pred: Pred,
  is_upper_bound: boolean,
) {
  if (lower === upper) {
    return lower;
  }
  let best_so_far = -1;
  while (lower <= upper) {
      const mid = Math.trunc(lower + (upper - lower) / 2); // int cast
      const matches_pred = pred(objects[arr[normalise(mid, N)]]);
      if (matches_pred) {
          best_so_far = mid;
      }
      // If we're looking for an upper bound:
          // If we match the predicate, go higher.
          // If not, go lower.
      // If we're looking for a lower bound:
          // If we match the predicate, go lower.
          // If not, go higher.
      if (matches_pred == is_upper_bound) {
        // Either "upper bound AND matches pred"
        // or "lower bound AND doesn't match pred"
        // We should go higher, so increase the lower bound.
        lower = mid + 1;
      } else {
        // The opposite.
        // Decrease the upper bound.
        upper = mid - 1;
      }
  }
  return best_so_far;
}

const is_zero = (n: number) => (Math.abs(n) < EPSILON);

/**
 * TODO: Wrap this in a class so we don't have to keep passing the same params
 * over and over again
 * Generates the successors of the search node and sets them in the successor
 * vector. Returns number of successors generated.
 */
export function get_successors(
  node: SearchNode,
  start: Point,
  mesh: Mesh,
  successors: Successor[],
) {
    // If the next polygon is -1, we did a bad job at pruning...
    if(node.next_polygon === -1) {
      throw Error('next polygon is -1, we did a bad job at pruning');
    }
    const polygon = mesh.mesh_polygons[node.next_polygon];
    const mesh_vertices = mesh.mesh_vertices;
    // V, P and N are solely used for conciseness
    const V = polygon.vertices;
    const N = V.length;

    const root = (node.root == -1 ? start : mesh_vertices[node.root].p);
    let out = 0;


    if (get_orientation(root, node.left, node.right) === OrientationType.CCW) {
      throw Error('Orientation of root, node.left, node.right must not be CCW');
    }

    {
      // Check collinearity.
      const root_l = node.left.sub(root);
      const root_r = node.right.sub(root);

      const root_eq_l = is_zero(root_l.x) && is_zero(root_l.y);
      const root_eq_r = is_zero(root_r.x) && is_zero(root_r.y);

      if (root_eq_l || root_eq_r || is_collinear(root, node.right, node.left)) {
        // It's collinear... but we don't know where to turn.
        // Find which endpoint is closer.
        // We can terminate early if we know the root is equal to one
        // of the endpoints.
        // Additionally, we can simply compare the absolute values of
        // the coordinates to find which is closer.
        let succ_type: SuccessorType;
        if (
          root_eq_l || (
            !root_eq_r && (
              Math.abs(root_l.x - root_r.x) < EPSILON
                ? Math.abs(root_l.y) < Math.abs(root_r.y)
                : Math.abs(root_l.x) < Math.abs(root_r.x)
              ))
          ) {
          // We should turn at L... if we can!
          if (!mesh_vertices[node.left_vertex].is_corner) {
            return 0;
          }
          succ_type = SuccessorType.LEFT_NON_OBSERVABLE;
        } else {
          // We should turn at R... if we can!
          if (!mesh_vertices[node.right_vertex].is_corner) {
            return 0;
          }
          succ_type = SuccessorType.RIGHT_NON_OBSERVABLE;
        }

        // We can be lazy and start iterating from any point.
        // We still need to exclude the current interval as a successor.
        let last_vertex = lastEl(V)!;

        for (let i = 0; i < N; i++) {
          const this_vertex = V[i];
          if (this_vertex === node.right_vertex) {
            // The interval we're going to generate is the same as our
            // current one, so skip it.
            last_vertex = this_vertex;
            continue;
          }
          const left = mesh_vertices[this_vertex].p;
          const right = mesh_vertices[last_vertex].p;
          successors[out++] = new Successor(succ_type, left, right, i);
          last_vertex = this_vertex;
        }
        return out;
      }
    }

    if (N == 3) {
      let p1: number; // V[p1] = t2. Used for poly_left_ind for 1-2 successors.
      let p2: number; // V[p2] = t3. Used for poly_left_ind for 2-3 successors.
      // Note that p3 is redundant, as that's the polygon we came from.

      // The right point of the triangle.
      const t1 = mesh_vertices[node.right_vertex].p;
      // The middle point of the triangle.
      const t2 = (() =>  {
        // horrible hacky lambda which also sets p1/p2

        // Let's get p1, p2 and t2.
        if (V[0] == node.right_vertex) {
        // t1 = V[0], t2 = V[1], t3 = V[2]
          p1 = 1;
          p2 = 2;
          return mesh_vertices[V[1]].p;
        }
        else if (V[0] == node.left_vertex) {
          // t1 = V[1], t2 = V[2], t3 = V[0]
          p1 = 2;
          p2 = 0;
          return mesh_vertices[V[2]].p;
        } else {
          // t1 = V[2], t2 = V[0], t3 = V[1]
          p1 = 0;
          p2 = 1;
          return mesh_vertices[V[0]].p;
        }
      })();

    // The left point of the triangle.
    const t3 = mesh_vertices[node.left_vertex].p;

    const L = node.left;
    const R = node.right;

    // Now we need to check the orientation of root-L-t2.
    // TODO: precompute a shared term for getting orientation,
    // like t2 - root.
    switch (get_orientation(root, L, t2)) {
      case OrientationType.CCW: {
        // LI in (1, 2)
        // RI in [1, 2)

        // TODO: precompute shared constants (assuming the compiler
        // doesn't)
        const LI = line_intersect(t1, t2, root, L);
        const RI = (R == t1 ? t1 : line_intersect(t1, t2, root, R));

        // observable(RI, LI)
        successors[0] = new Successor(
          SuccessorType.OBSERVABLE,
          LI, RI,
          p1 // a 1-2 successor
        );

        // if we can turn left
        if (mesh_vertices[node.left_vertex].is_corner && L == t3) {
          // left_non_observable(LI, 2)
          successors[1] = new Successor(
              SuccessorType.LEFT_NON_OBSERVABLE,
              t2, LI,
              p1 // a 1-2 successor
          );
          // left_collinear(2, 3)
          successors[2] = new Successor(
              SuccessorType.LEFT_NON_OBSERVABLE,
              t3, t2,
              p2 // a 2-3 successor
          );
          return 3;
        }
        return 1;
      }

      case OrientationType.COLLINEAR: {
        // LI = 2
        // RI in [1, 2)
        const RI = (R == t1
          ? t1 : line_intersect(t1, t2, root, R));

        // observable(RI, 2)
        successors[0] = new Successor(
          SuccessorType.OBSERVABLE,
          t2, RI,
          p1 // a 1-2 successor
        );

        // if we can turn left
        if (mesh_vertices[node.left_vertex].is_corner && L == t3) {
          // left_collinear(2, 3)
          successors[1] = new Successor(
            SuccessorType.LEFT_NON_OBSERVABLE,
            t3, t2,
            p2 // a 2-3 successor
          );

          return 2;
        }

        return 1;
      }

      case OrientationType.CW: {
        // LI in (2, 3]
        const LI = (L == t3 ? t3 : line_intersect(t2, t3, root, L));

        // Now we need to check the orientation of root-R-t2.
        switch (get_orientation(root, R, t2)) {
          case OrientationType.CW: {
            // RI in (2, 3)
            const RI = line_intersect(t2, t3, root, R);

            // if we can turn right
            if (mesh_vertices[node.right_vertex].is_corner && R == t1) {
              // right_collinear(1, 2)
              successors[0] = new Successor(
                SuccessorType.RIGHT_NON_OBSERVABLE,
                t2, t1,
                p1 // a 1-2 successor
              );

              // right_non_observable(2, RI)
              successors[1] = new Successor(
                SuccessorType.RIGHT_NON_OBSERVABLE,
                RI, t2,
                p2 // a 2-3 successor
              );

              // observable(RI, LI)
              successors[2] = new Successor(
                SuccessorType.OBSERVABLE,
                LI, RI,
                p2 // a 2-3 successor
              );

              return 3;
            }

            // observable(RI, LI)
            successors[0] = new Successor(
              SuccessorType.OBSERVABLE,
              LI, RI,
              p2 // a 2-3 successor
            );

            return 1;
          }

          case OrientationType.COLLINEAR: {
            // RI = 2
            // if we can turn right
            if (mesh_vertices[node.right_vertex].is_corner && R == t1) {
              // right_collinear(1, 2)
              successors[0] = new Successor(
                SuccessorType.RIGHT_NON_OBSERVABLE,
                t2, t1,
                p1 // a 1-2 successor
              );

              // observable(2, LI)
              successors[1] = new Successor(
                SuccessorType.OBSERVABLE,
                LI, t2,
                p2 // a 2-3 successor
              );

              return 2;
            }

            // observable(2, LI)
            successors[0] = new Successor(
              SuccessorType.OBSERVABLE,
              LI, t2,
              p2 // a 2-3 successor
            );

            return 1;
          }

          case OrientationType.CCW: {
            // RI in [1, 2)
            const RI = (R == t1 ? t1 : line_intersect(t1, t2, root, R));

            // observable(RI, 2)
            successors[0] = new Successor(
              SuccessorType.OBSERVABLE,
              t2, RI,
              p1 // a 1-2 successor
            );

            // observable(2, LI)
            successors[1] = new Successor(
              SuccessorType.OBSERVABLE,
              LI, t2,
              p2 // a 2-3 successor
            );
          }
        }
      }
    }
  }


  // It is not collinear.
  // Find the starting vertex (the "right" vertex).

  // Note that "_ind" means "index in V/P",
  // "_vertex" means "index of mesh_vertices".
  // "_vertex_obj" means "object of the vertex" and
  // "_p" means "point".
  const right_ind = (() => {
    // TODO: Compare to std::find.
    let temp = 0; // position of vertex in V
    while (V[temp] != node.right_vertex) {
      temp++;
      // assert(temp < N);
    }
    return temp;
  })();
  // Note that left_ind MUST be greater than right_ind.
  // This will make binary searching easier.
  const left_ind = N + right_ind - 1;

  // assert(V[normalise(left_ind)] == node.left_vertex);

  // Find whether we can turn at either endpoint.
  const right_vertex_obj = mesh_vertices[node.right_vertex];
  const left_vertex_obj  = mesh_vertices[V[normalise(left_ind, N)]];

  const right_p = right_vertex_obj.p;
  const left_p  = left_vertex_obj.p;
  const right_lies_vertex = right_p == node.right;
  const left_lies_vertex = left_p == node.left;

  // // Macro for getting a point from a polygon point index.
  // #define index2point(index) mesh_vertices[V[index]].p
  const index2point = (index: number) => mesh_vertices[V[index]].p

  // find the transition between non-observable-right and observable.
  // we will call this A, defined by:
  // "first P such that root-right-p is strictly CCW".
  // lower bound is right+1, as root-right-right is not CCW (it is collinear).
  // upper bound is left.
  // the "transition" will lie in the range [A-1, A)

  const root_right = node.right.sub(root);
  const A = (() => {
    if (right_lies_vertex) {
      // Check whether root-right-right+1 is collinear or CCW.
      if (root_right.cross(index2point(normalise(right_ind + 1, N)).sub(node.right)) > -EPSILON) {
        // Intersects at right, so...
        // we should use right_ind+1!
        return right_ind + 1;
      }
    }
    return binary_search(
      V, N, mesh_vertices, right_ind + 1, left_ind,
      (v: Vertex) => root_right.cross(v.p.sub(node.right)) > EPSILON,
      false,
    );
  })();
  // assert(A != -1);
  const normalised_A = normalise(A, N), normalised_Am1 = normalise(A-1, N);

  const A_p = index2point(normalised_A);
  const Am1_p = index2point(normalised_Am1);
  const right_intersect = right_lies_vertex && A == right_ind + 1
    ? node.right
    : line_intersect(A_p, Am1_p, root, node.right);

  // find the transition between observable and non-observable-left.
  // we will call this B, defined by:
  // "first P such that root-left-p is strictly CW".
  // lower-bound is A - 1 (in the same segment as A).
  // upper bound is left-1, as we don't want root-left-left.
  // the "transition" will lie in the range (B, B+1]
  const root_left = node.left.sub(root);
  const B = (() => {
    if (left_lies_vertex) {
      // Check whether root-left-left-1 is collinear or CW.
      if (root_left.cross(index2point(normalise(left_ind - 1, N)).sub(node.left)) < EPSILON) {
        // Intersects at left, so...
        // we should use left_ind-1!
        return left_ind - 1;
      }
    }
    return binary_search(
      V, N, mesh_vertices, A - 1, left_ind - 1,
      (v: Vertex) => root_left.cross(v.p.sub(node.left)) < -EPSILON,
      true,
    );
  })();
  // assert(B != -1);
  const normalised_B = normalise(B, N),
  normalised_Bp1 = normalise(B+1, N);
  const B_p = index2point(normalised_B);
  const Bp1_p = index2point(normalised_Bp1);
  const left_intersect = left_lies_vertex && B == left_ind - 1
    ? node.left
    : line_intersect(B_p, Bp1_p, root, node.left);

  // Macro to update this_inde/last_ind.
  // #define update_ind() last_ind = cur_ind++; if (cur_ind == N) cur_ind = 0

  if (right_lies_vertex && right_vertex_obj.is_corner) {
    // Generate non-observable.

    // Generate non-observable to Am1.
    // Generate non-observable from Am1 to intersect
    // if right_intersect != Am1_p.

    // We always generate successors from last_ind to cur_ind.
    // right_ind should always be normalised.
    // assert(normalise(right_ind) == right_ind);
    let last_ind = right_ind;
    let cur_ind = normalise(right_ind + 1, N);

    // Generate non-observable to Am1.
    while (last_ind != normalised_Am1) {
      // Generate last-cur, turning at right.
      successors[out++] = new Successor(
        SuccessorType.RIGHT_NON_OBSERVABLE,
        index2point(cur_ind), index2point(last_ind),
        cur_ind
      );

      // update_ind();
      last_ind = cur_ind++; if (cur_ind == N) cur_ind = 0
    }
    // assert(cur_ind == normalised_A);

    if (right_intersect != Am1_p) {
      // Generate Am1-right_intersect, turning at right.
      successors[out++] = new Successor(
        SuccessorType.RIGHT_NON_OBSERVABLE,
        right_intersect, Am1_p,
        normalised_A
      );
    }
  }

  // Start at Am1.
  // last_node = right_intersect
  // If index is normalised_Bp1, go from last_node to left_intersect.
  // (And terminate too!)
  // Else, go to the end and set that as last_node

  // Special case when there are NO observable successors.
  if (A == B + 2) {
    // Do nothing.
  } else if (A == B + 1) {
    // Special case when there only exists one observable successor.
    // Note that we used the non-normalised indices for this.
    successors[out++] = new Successor(
      SuccessorType.OBSERVABLE,
      left_intersect, right_intersect,
      normalised_A // (the same as normalised_Bp1)
    );
  } else {
    // Generate first (probably non-maximal) successor
    // (right_intersect-A)
    successors[out++] = new Successor(
      SuccessorType.OBSERVABLE,
      A_p, right_intersect,
      normalised_A,
    );

    // Generate all guaranteed-maximal successors.
    // Should generate B-A of them.
    let last_ind = normalised_A;
    let cur_ind = normalise(A+1, N);

    // #ifndef NDEBUG
    // int counter = 0;
    // #endif

    while (last_ind != normalised_B) {
      // #ifndef NDEBUG
      // counter++;
      // #endif

      // Generate last-cur.
      successors[out++] = new Successor(
        SuccessorType.OBSERVABLE,
        index2point(cur_ind), index2point(last_ind),
        cur_ind,
      );

      // update_ind();
      last_ind = cur_ind++; if (cur_ind == N) cur_ind = 0
    }

    // #ifndef DEBUG
    // assert(counter == B - A);
    // #endif

    // Generate last (probably non-maximal) successor
    // (B-left_intersect)
    successors[out++] = new Successor(
      SuccessorType.OBSERVABLE,
      left_intersect, B_p,
      normalised_Bp1,
    );
  }

  if (left_lies_vertex && left_vertex_obj.is_corner) {
    // Generate non-observable from left_intersect to Bp1_p
    // if left_intersect != Bp1_p.
    // Generate non-observable up to end.
    // Generate left_intersect-Bp1, turning at left.
    if (left_intersect != Bp1_p) {
      successors[out++] = new Successor(
        SuccessorType.LEFT_NON_OBSERVABLE,
        Bp1_p, left_intersect,
        normalised_Bp1
      );
    }

    let last_ind = normalised_Bp1;
    let cur_ind = normalise(B + 2, N);

    const normalised_left_ind = normalise(left_ind, N);
    while (last_ind != normalised_left_ind) {
      // Generate last_ind-cur_ind, turning at left.
      successors[out++] = new Successor(
        SuccessorType.LEFT_NON_OBSERVABLE,
        index2point(cur_ind), index2point(last_ind),
        cur_ind,
      );

      // update_ind();
      last_ind = cur_ind++; if (cur_ind == N) cur_ind = 0
      }
    }

  return out;
}
