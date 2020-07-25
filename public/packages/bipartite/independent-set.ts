/**
 * Find a maximum independent set of a bipartite graph.
 * Source: https://github.com/mikolalysenko/bipartite-independent-set/blob/master/indepset.js
 */
import vertexCover from './vertex-cover';
import { Edge } from './matching';

type IndependentSet = [number[], number[]];

/**
 * @param n is the number of vertices in the domain.
 * @param m is the number of vertices in the codomain.
 * @param edges defines the binary relation from `n` to `m`.
 */
export default function bipartiteIndependentSet(
  n: number,
  m: number,
  edges: Edge[],
): IndependentSet {
  const [left, right] = vertexCover(n, m, edges);
  return [
    complement(left, n),
    complement(right, m),
  ];
}

// TODO explain
function complement(
  /** Covered nodes in bipartition */
  covered: number[],
  /** Size of bipartition */
  size: number
) {
  const result = new Array(size - covered.length);
  let a = 0, b = 0;
  covered.sort(compareInt);

  for(let i = 0; i < size; ++i) {
    if(covered[a] === i) {
      a++;
    } else {
      result[b++] = i
    }
  }
  return result
}

function compareInt(a: number, b: number) {
  return a - b;
}
