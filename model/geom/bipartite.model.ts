// For npm modules:
// - bipartite-matching
// - bipartite-vertex-cover
// - rectangle-decomposition

export type Edge = [number, number];

export type BipartitionedSet = [number[], number[]];

export interface BipartiteGraph {
  /** Number of vertices in lower bipartition. */
  n: number;
  /** Number of vertices in upper bipartition. */
  m: number;
  /** Edges `[i, j]` where `i` in `[0..n-1]` and `j` in `[0..m-1]` */
  edges: Edge[];
}
