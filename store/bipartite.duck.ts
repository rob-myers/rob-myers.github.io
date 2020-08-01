import maximalMatching from 'bipartite-matching';
import { createThunk, ActionsUnion } from '@model/store/redux.model';
import { BipartiteGraph, Edge, State as BipartiteState } from '@public-reducer/bipartite.types';

export type State = BipartiteState;

const initialState: State = {};

export const Act = {};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  getMaximalMatching: createThunk(
    '[bipartite] get maximal matching',
    (_, graph: BipartiteGraph) =>
    maximalMatching(graph.n, graph.m, graph.edges),
  ),
  // minimalVertexCover: createThunk(
  //   '[@bipartite] minimal vertex cover',
  //   (_, graph: BipartiteGraph) =>
  //   minimalVertexCover(graph.n, graph.m, graph.edges),
  // ),
  // maximalIndependentSet: createThunk(
  //   '[@bipartite] maximal independent set',
  //   (_, graph: BipartiteGraph) =>
  //   maximalIndependentSet(graph.n, graph.m, graph.edges),
  // ),
  getRandomGraph: createThunk(
    '[bipartite] get random graph',
    (_, { n, m, edgeProbability: p }: {
      n: number;
      m: number;
      /** Between 0 and 1 (inclusive) */
      edgeProbability: number;
    }): BipartiteGraph => {
      return {
        n,
        m,
        edges: [...Array(n)].reduce((agg, _, i) =>
          agg.concat(...[...Array(m)].map((_, j) => Math.random() < p ? [[i, j]] : []))
        , [] as Edge[])
      };
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
