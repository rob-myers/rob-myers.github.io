import { createThunk, ActionsUnion } from '@package/shared/redux.model';

import maximalMatching, { Edge } from './matching';
import minimalVertexCover from './vertex-cover';
import maximalIndependentSet from './independent-set';

export interface State {}

const initialState: State = {};

export const Act = {};

export type Action = ActionsUnion<typeof Act>;

export interface BipartiteGraph {
  /** Number of vertices in lower bipartition. */
  n: number;
  /** Number of vertices in upper bipartition. */
  m: number;
  /** Edges `[i, j]` where `i` in `[0..n-1]`, `j` in `[0..m-1]` */
  edges: Edge[];
}

export const Thunk = {
  maximalMatching: createThunk(
    '[@bipartite] maximal matching',
    (_, graph: BipartiteGraph) =>
    maximalMatching(graph.n, graph.m, graph.edges),
  ),
  minimalVertexCover: createThunk(
    '[@bipartite] minimal vertex cover',
    (_, graph: BipartiteGraph) =>
    minimalVertexCover(graph.n, graph.m, graph.edges),
  ),
  maximalIndependentSet: createThunk(
    '[@bipartite] maximal independent set',
    (_, graph: BipartiteGraph) =>
    maximalIndependentSet(graph.n, graph.m, graph.edges),
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
