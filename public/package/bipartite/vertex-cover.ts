/**
 * Find a minimum vertex cover.
 * Source: https://github.com/mikolalysenko/bipartite-vertex-cover/blob/master/vcover.js
 */
import * as pool from '@package/performance/array-pool';
import bipartiteMatching, { Edge } from './matching';

type Cover = [number[], number[]];

/**
 * @param n is the number of vertices in the domain.
 * @param m is the number of vertices in the codomain.
 * @param edges defines the binary relation from `n` to `m`.
 */
export default function bipartiteVertexCover(
  n: number,
  m: number,
  edges: Edge[],
): Cover {
  const match = bipartiteMatching(n, m, edges)

  // Initialize adjacency lists
  const adjL = [...new Array(n)].map(_ => [] as number[]);
  const adjR = [...new Array(m)].map(_ => [] as number[]);
  const matchL = pool.mallocInt32(n).fill(-1);
  const matchR = pool.mallocInt32(m).fill(-1)
  const coverL = pool.mallocInt32(n).fill(0);
  const coverR = pool.mallocInt32(m).fill(0);
  const matchCount = pool.mallocInt32(n).fill(0);

  // Unpack matched edges
  for (const [src, dst] of match) {
    matchL[src] = dst;
    matchR[dst] = src;
  };

  // Loop over input edges
  for (const [src, dst] of edges) {
    if(matchL[src] === dst && !(matchCount[src]++)) {
      continue;
    }
    adjL[src].push(dst)
    adjR[dst].push(src);
  };

  // Construct cover
  const left = [] as number[];
  const right = [] as number[];
  for(let i = 0; i < n; ++i) {
    walk(right, i, adjL, matchL, coverL, matchR, coverR)
  }
  for(let i = 0; i < m; ++i) {
    walk(left, i, adjR, matchR, coverR, matchL, coverL) 
  }

  // Clean up left-over edges
  for(let i = 0; i < n; ++i) {
    if(!coverL[i] && matchL[i] >= 0) {
      coverR[matchL[i]] = coverL[i] = 1
      left.push(i)
    }
  }

  pool.free(coverR)
  pool.free(matchR)
  pool.free(coverL)
  pool.free(matchCount)
  pool.free(matchL)

  return [ left, right ]
}

// TODO explain
function walk(
  list: number[],
  v: number,
  adjL: number[][],
  matchL: Int32Array,
  coverL: Int32Array,
  matchR: Int32Array,
  coverR: Int32Array,
) {
  if(coverL[v] || matchL[v] >= 0) {
    return
  }
  while(v >= 0) {
    coverL[v] = 1
    var adj = adjL[v]
    var next = -1
    for(var i=0,l=adj.length; i<l; ++i) {
      var u = adj[i]
      if(coverR[u]) {
        continue
      }
      next = u
    }
    if(next < 0) {
      break;
    }
    coverR[next] = 1;
    list.push(next);
    v = matchR[next];
  }
}
