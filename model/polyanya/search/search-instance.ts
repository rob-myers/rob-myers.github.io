import TinyQueue from 'tinyqueue';
import Point from "../structs/point";
import SearchNode from '../structs/search-node';
import Mesh, { PointLocationType } from '../structs/mesh';
import Successor, { SuccessorType } from '../structs/successor';
import { EPSILON } from '../structs/consts';
import { testNever, last as lastEl } from '@model/generic.model';
import { get_h_value, get_successors } from './expansion';

export default class SearchInstance {

  private start!: Point;
  private goal!: Point;
  private final_node!: null | SearchNode;
  private end_polygon!: number; // set by init_search
  private open_list!: TinyQueue<SearchNode>;
  // Best g value for a specific vertex.
  private root_g_values!: number[];
  // Contains the current search id if the root has been reached by
  // the search.
  private root_search_ids!: number[];  // also used for root-level pruning
  private search_id!: number;
  private search_successors!: Successor[];
  private search_nodes_to_push!: SearchNode[];

  public nodes_generated!: number;        // Nodes stored in memory
  public nodes_pushed!: number;           // Nodes pushed onto open
  public nodes_popped!: number;           // Nodes popped off open
  public nodes_pruned_post_pop!: number;  // Nodes we prune right after popping off
  public successor_calls!: number;         // Times we call get_successors
  public verbose!: boolean;
  // warthog::mem::cpool* node_pool;
  // warthog::timer timer;

  constructor(
    private mesh: Mesh,
  ) {
    this.init();
  }

  private init() {
    this.verbose = false;
    this.search_successors = [];
    this.search_nodes_to_push = [];
    // node_pool = new warthog::mem::cpool(sizeof(SearchNode));
    this.init_root_pruning();
  }
  
  private init_root_pruning() {
      // assert(this.mesh != nullptr);
      this.search_id = 0;
  }

  private init_search() {
    // assert(node_pool);
    this.search_id++;
    this.open_list = new TinyQueue<SearchNode>(
      undefined,
      (a, b) => a.greaterThan(b) ? -1 : 1,
    );
    this.final_node = null;
    this.nodes_generated = 0;
    this.nodes_pushed = 0;
    this.nodes_popped = 0;
    this.nodes_pruned_post_pop = 0;
    this.successor_calls = 0;
    this.set_end_polygon();
    this.gen_initial_nodes();
  }

  public set_start_goal(s: Point, g: Point) {
    this.start = s;
    this.goal = g;
    this.final_node = null;
  }

  public get_cost() {
    if (this.final_node === null) {
      return -1;
    }
    return this.final_node?.f || null;
  }

  get_point_location(p: Point) {
      // assert(mesh != nullptr);
      const out = this.mesh.get_point_location(p);
      if (out.type == PointLocationType.ON_CORNER_VERTEX_AMBIG) {
        // Add a few EPSILONS to the point and try again.
        const CORRECTOR = new Point(EPSILON * 10, EPSILON * 10);
        let corrected = p.add(CORRECTOR);
        let corrected_loc = this.mesh.get_point_location(corrected);

        // #ifndef NDEBUG
        // if (this.verbose) {
          // console.error(`${p} ${corrected_loc}`);
          // std::cerr << p << " " << corrected_loc << std::endl;
        // }
        // #endif

        switch (corrected_loc.type) {
          case PointLocationType.ON_CORNER_VERTEX_AMBIG:
          case PointLocationType.ON_CORNER_VERTEX_UNAMBIG:
          case PointLocationType.ON_NON_CORNER_VERTEX:
            // #ifndef NDEBUG
            if (this.verbose) {
              // std::cerr << "Warning: corrected " << p << " lies on vertex"
              //           << std::endl;
              console.error(`Warning: corrected ${p} lies on vertex`);
            }
            // #endif
            break;
          case PointLocationType.NOT_ON_MESH:
            // #ifndef NDEBUG
            if (this.verbose) {
              // std::cerr << "Warning: completely ambiguous point at " << p
              //           << std::endl;
              console.error(`Warning: completely ambiguous point at ${p}`);
            }
            // #endif
            break;
          case PointLocationType.IN_POLYGON:
          case PointLocationType.ON_MESH_BORDER:
          // Note that ON_EDGE should be fine: any polygon works and there's
          // no need to special case successor generation.
          case PointLocationType.ON_EDGE:
              out.poly1 = corrected_loc.poly1;
              break;
          default:
              // Should be impossible to reach.
              // assert(false);
              throw testNever(corrected_loc.type);
        }
      }
      return out;
  }

  succ_to_node(
    parent: SearchNode,
    successors: Successor[],
    num_succ: number,
    nodes: SearchNode[],
  ) {
      // asser  t(mesh != nullptr);
    const polygon = this.mesh.mesh_polygons[parent.next_polygon];
    const V = polygon.vertices;
    const P = polygon.polygons;

    let right_g = -1, left_g = -1;
  
    let out = 0;
    for (let i = 0; i < num_succ; i++) {
      const succ = successors[i];
      const next_polygon = P[succ.poly_left_ind];
      if (next_polygon == -1) {
        continue;
      }

      // If the successor we're about to push pushes into a one-way polygon,
      // and the polygon isn't the end polygon, just continue.
      if (
        this.mesh.mesh_polygons[next_polygon].is_one_way &&
        next_polygon != this.end_polygon
      ) {
        continue;
      }
      const left_vertex = V[succ.poly_left_ind];
      const right_vertex = succ.poly_left_ind
        ? V[succ.poly_left_ind - 1]
        : lastEl(V)!;

      // Note that g is evaluated twice here. (But this is a lambda!)
      // Always try to precompute before using this macro.
      // We implicitly set h to be zero and let search() update it.
      const p = (root: number, g: number) => {
        if (root != -1) {
          // assert(root >= 0 && root < (int) root_g_values.size());
          // Can POSSIBLY prune?
          if (this.root_search_ids[root] != this.search_id) {
            // First time reaching root
            this.root_search_ids[root] = this.search_id;
            this.root_g_values[root] = g;
          } else {
            // We've been here before!
            // Check whether we've done better.
            if (this.root_g_values[root] + EPSILON < g) {
              // We've done better!
              return;
            } else {
              // This is better.
              this.root_g_values[root] = g;
            }
          }
        }
        nodes[out++] = new SearchNode(
          null, root, succ.left, succ.right, left_vertex,
          right_vertex, next_polygon, g, g,
        );
      };

      const parent_root = (parent.root === -1
        ? this.start
        : this.mesh.mesh_vertices[parent.root].p);
      
      const get_g = (new_root: Point) => parent.g + parent_root.distance(new_root);

      switch (succ.type) {
        case SuccessorType.RIGHT_NON_OBSERVABLE:
          if (right_g == -1) {
            right_g = get_g(parent.right);
          }
          p(parent.right_vertex, right_g);
          break;

        case SuccessorType.OBSERVABLE:
          p(parent.root, parent.g);
          break;
        case SuccessorType.LEFT_NON_OBSERVABLE:
          if (left_g == -1) {
            left_g = get_g(parent.left);
          }
          p(parent.left_vertex, left_g);
          break;
        default:
            // assert(false);
            throw testNever(succ.type);
      }
      // #undef get_h
      // #undef get_g
    }
  
    return out;
  }

  set_end_polygon() {
    // Any polygon is fine.
    this.end_polygon = this.get_point_location(this.goal).poly1;
  }

  gen_initial_nodes() {
    // {parent, root, left, right, next_polygon, right_vertex, f, g}
    // be VERY lazy and abuse how our function expands collinear search nodes
    // if right_vertex is not valid, it will generate EVERYTHING
    // and we can set right_vertex if we want to omit generating an interval.
    const pl = this.get_point_location(this.start);
    const h = this.start.distance(this.goal);

    // #define get_lazy(next, left, right) new (node_pool->allocate()) SearchNode \
    //     {nullptr, -1, start, start, left, right, next, h, 0}
    const get_lazy = (next: number, left: number, right: number) => new SearchNode(
      null, -1, this.start, this.start, left, right, next, h, 0
    );
    // #define v(vertex) mesh->mesh_vertices[vertex]
    const v = (vertex: number) => this.mesh.mesh_vertices[vertex];

    const push_lazy = (lazy: SearchNode) => {
        const poly = lazy.next_polygon;
        if (poly == -1) {
          return;
        }
        if (poly === this.end_polygon) {
          // Trivial case - we can see the goal from start!
          this.final_node = lazy;
          // #ifndef NDEBUG
          // if (verbose) {
          //     std::cerr << "got a trivial case!" << std::endl;
          // }
          // #endif
          // we should check final_node after each push_lazy
          return;
        }
        // iterate over poly, throwing away vertices if needed
        const vertices = this.mesh.mesh_polygons[poly].vertices;
        let successors = [] as Successor[];
        let last_vertex = lastEl(vertices)!;
        let num_succ = 0;
        for (let i = 0; i < vertices.length; i++) {
          let vertex = vertices[i];
          if (
            vertex === lazy.right_vertex
            || last_vertex === lazy.left_vertex
          ) {
            last_vertex = vertex;
            continue;
          }
          successors[num_succ++] = new Successor(
              SuccessorType.OBSERVABLE, v(vertex).p,
                v(last_vertex).p, i);
          last_vertex = vertex;
        }
        let nodes = [] as SearchNode[];
        const num_nodes = this.succ_to_node(lazy, successors, num_succ, nodes);
        // delete[] successors;
        for (let i = 0; i < num_nodes; i++) {
            // SearchNodePtr n = new (node_pool->allocate()) SearchNode(nodes[i]);
            let n = nodes[i];
            const n_root = (n.root === -1
              ? this.start
              : this.mesh.mesh_vertices[n.root].p);
            n.f += get_h_value(n_root, this.goal, n.left, n.right);
            n.parent = lazy;
            // #ifndef NDEBUG
            // if (verbose)
            // {
            //     std::cerr << "generating init node: ";
            //     print_node(n, std::cerr);
            //     std::cerr << std::endl;
            // }
            // #endif
            this.open_list.push(n);
        }
        // delete[] nodes;
        this.nodes_generated += num_nodes;
        this.nodes_pushed += num_nodes;
    };

    switch (pl.type) {
      // Don't bother.
      case PointLocationType.NOT_ON_MESH:
        break;

      // Generate all in an arbirary polygon.
      case PointLocationType.ON_CORNER_VERTEX_AMBIG:
        // It's possible that it's -1!
        if (pl.poly1 == -1) {
          break;
        }
      case PointLocationType.ON_CORNER_VERTEX_UNAMBIG:
      // Generate all in the polygon.
      case PointLocationType.IN_POLYGON:
      case PointLocationType.ON_MESH_BORDER: {
          let lazy = get_lazy(pl.poly1, -1, -1);
          push_lazy(lazy);
          this.nodes_generated++;
          break;
      }
      case PointLocationType.ON_EDGE: {
        // Generate all in both polygons except for the shared side.
        let lazy1 = get_lazy(pl.poly2, pl.vertex1, pl.vertex2);
        let lazy2 = get_lazy(pl.poly1, pl.vertex2, pl.vertex1);
        push_lazy(lazy1);
        this.nodes_generated++;
        if (this.final_node) {
          return;
        }
        push_lazy(lazy2);
        this.nodes_generated++;
        break;
      }
      case PointLocationType.ON_NON_CORNER_VERTEX: {
        for (const poly of v(pl.vertex1).polygons) {
          let lazy = get_lazy(poly, pl.vertex1, pl.vertex1);
          push_lazy(lazy);
          this.nodes_generated++;
          if (this.final_node) {
            return;
          }
        }
        break;
      }
      default:
        throw testNever(pl.type);
    }
    // #undef v
    // #undef get_lazy
  }

  // #define root_to_point(root) ((root) == -1 ? start : mesh->mesh_vertices[root].p)
  root_to_point = (root: number) => ((root) == -1 ? this.start : this.mesh.mesh_vertices[root].p)
  
  search() {
    // timer.start();
    this.init_search();
    if (this.mesh === null || this.end_polygon == -1) {
        // timer.stop();
        return false;
    }

    if (this.final_node != null) {
        // timer.stop();
        return true;
    }

    while (this.open_list.length) {
      let node = this.open_list.pop()!;

      // #ifndef NDEBUG
      // if (verbose)
      // {
      //     std::cerr << "popped off: ";
      //     print_node(node, std::cerr);
      //     std::cerr << std::endl;
      // }
      // #endif

      this.nodes_popped++;
      const next_poly = node.next_polygon;
      if (next_poly == this.end_polygon) {
        // Make the TRUE final node.
        // (We usually push it onto the open list, but we know it's going
        // to be immediately popped off anyway.)

        // We need to find whether we need to turn left/right to ge
        // to the goal, so we do an orientation check like how we
        // special case triangle successors.

        const final_root = (() => {
          const root = this.root_to_point(node.root);
          const root_goal = this.goal.sub(root);
          // If root-left-goal is not CW, use left.
          if (root_goal.cross(node.left.sub(root)) < -EPSILON) {
            return node.left_vertex;
          }
          // If root-right-goal is not CCW, use right.
          if ((node.right.sub(root)).cross(root_goal) < -EPSILON) {
            return node.right_vertex;
          }
          // Use the normal root.
          return node.root;
        })();

        const true_final = new SearchNode(
          node, final_root, this.goal, this.goal, -1, -1, this.end_polygon, node.f, node.g);

        this.nodes_generated++;

        // timer.stop();

        // #ifndef NDEBUG
        // if (verbose)
        // {
        //     std::cerr << "found end - terminating!" << std::endl;
        // }
        // #endif

        this.final_node = true_final;
        return true;
      }
      // We will never update our root list here.
      const root = node.root;
      if (root != -1) {
        // assert(root >= 0 && root < (int) root_g_values.size());
        if (this.root_search_ids[root] == this.search_id) {
          // We've been here before!
          // Check whether we've done better.
          if (this.root_g_values[root] + EPSILON < node.g) {
            this.nodes_pruned_post_pop++;

            // #ifndef NDEBUG
            // if (verbose)
            // {
            //     std::cerr << "node is dominated!" << std::endl;
            // }
            // #endif

            // We've done better!
            continue;
          }
        }
      }
      let num_nodes = 1;
      this.search_nodes_to_push[0] = node;

      // We use a do while here because the first iteration is guaranteed
      // to work.
      do {
        let cur_node = this.search_nodes_to_push[0];
        // don't forget this!!!
        if (cur_node.next_polygon == this.end_polygon) {
          break;
        }
        let num_succ = get_successors(cur_node, this.start, this.mesh, this.search_successors);
        this.successor_calls++;
        num_nodes = this.succ_to_node(cur_node, this.search_successors, num_succ, this.search_nodes_to_push);
        if (num_nodes === 1) {
          // Did we turn?
          if (cur_node.g != this.search_nodes_to_push[0].g) {
            // Turned. Set the parent of this, and set the current
            // node pointer to this after allocating space for it.
            this.search_nodes_to_push[0].parent = node;
            node = this.search_nodes_to_push[0];
            this.nodes_generated++;
          }

          // #ifndef NDEBUG
          // if (verbose)
          // {
          //     std::cerr << "\tintermediate: ";
          //     print_node(&search_nodes_to_push[0], std::cerr);
          //     std::cerr << std::endl;
          // }
          // #endif
        }
      }
      while (num_nodes == 1); // if num_nodes == 0, we still want to break

      for (let i = 0; i < num_nodes; i++) {
        const cur_node = this.search_nodes_to_push[i];
        // We need to update the h value before we push!

        // if we turned before, AND we immediately broke out of the
        // do-while loop, then cur_node has a valid parent pointer
        // and cur_node is equivalent to node.
        // so: if cur_node has a parent pointer, then "node"
        // is the thing we want to push.
        let n = null as null | SearchNode;
        if (cur_node.parent) {
          // valid!
          n = node;
          // note that we should decrement nodes_generated here
          // as we overcount because of this
          this.nodes_generated--;
        } else {
          // need to allocate it in mempool
          // AND set a valid parent pointer
          n = cur_node;
          n.parent = node;
        }
        const n_root = (n.root == -1
          ? this.start
          : this.mesh.mesh_vertices[n.root].p);
        n.f += get_h_value(n_root, this.goal, n.left, n.right);

        // #ifndef NDEBUG
        // if (verbose)
        // {
        //     std::cerr << "\tpushing: ";
        //     print_node(n, std::cerr);
        //     std::cerr << std::endl;
        // }
        // #endif

        this.open_list.push(n);
      }
      this.nodes_generated += num_nodes;
      this.nodes_pushed += num_nodes;
    }

    // timer.stop();
    return false;
  }

  print_node(node: SearchNode) {
    return `root=${
      this.root_to_point(node.root)
    }; left=${
      node.left
    }; right=${
      node.right
    }; f=${
      node.f
    }, g=${
      node.g
    }`;
    /*
    outfile << "; col=" << [&]() -> std::string
            {
                switch (node->col_type)
                {
                    case SearchNode::NOT:
                        return "NOT";
                    case SearchNode::RIGHT:
                        return "RIGHT";
                    case SearchNode::LEFT:
                        return "LEFT";
                    case SearchNode::LAZY:
                        return "LAZY";
                    default:
                        return "";
                }
            }();
    */
  }
  
  get_path_points(out: Point[]) {
    if (this.final_node === null) {
      return;
    }
    out.length = 0;
    out.push(this.goal);
    let cur_node = this.final_node as SearchNode | null;

    while (cur_node != null) {
      if (this.root_to_point(cur_node.root) != lastEl(out)) {
          out.push(this.root_to_point(cur_node.root));
      }
      cur_node = cur_node.parent;
    }
    out.reverse();
  }

  print_search_nodes() {
    if (this.final_node == null) {
      return '';
    }
    let cur_node = this.final_node as SearchNode | null;
    const text = [] as string[];

    while (cur_node != null) {
      text.push(this.print_node(cur_node));
      text.push(this.mesh.print_polygon(cur_node.next_polygon));
      text.push('');
      cur_node = cur_node.parent;
    }

    return text.join('\n');
  }
}


