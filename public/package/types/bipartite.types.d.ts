// Used by @store/bipartite.duck.ts and monaco-editor at runtime.

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

/**
 * Currently empty. Could e.g. cache results.
 * Used by @store/test.duck and also `useSelector` at runtime.
 */
export interface State {}

/**
 * Must keep in sync with `Act` from @store/bipartite.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableSync = never;

/**
 * Must keep in sync with `Thunk` from @store/bipartite.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableThunk = (
  | { type: '[bipartite] get maximal independent set'; args: BipartiteGraph; returns: BipartitionedSet[] }
  | { type: '[bipartite] get maximal matching'; args: BipartiteGraph; returns: Edge[] }
  | { type: '[bipartite] get minimal vertex cover'; args: BipartiteGraph; returns: BipartitionedSet[] }
  | { type: '[bipartite] get random graph'; args: { n: number; m: number; edgeProbability: number; }; returns: BipartiteGraph }
);
