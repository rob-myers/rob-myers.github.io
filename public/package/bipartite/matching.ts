/**
 * Find a maximum bipartite matching in a bipartite graph.
 * Source: https://github.com/mikolalysenko/bipartite-matching/blob/master/match.js
 * Source: https://en.wikipedia.org/wiki/Hopcroft%E2%80%93Karp_algorithm
 */

const INF = 1 << 28;
export type Edge = [number, number];

/**
 * @param n is the number of vertices in the domain.
 * @param m is the number of vertices in the codomain.
 * @param edges defines the binary relation from `n` to `m`.
 */
export default function bipartiteMatching(
  n: number,
  m: number,
  edges: Edge[],
): Edge[] {

  // Initalize adjacency lists, matchings, distances
  const adjN = [...new Array(n)].map(_ => [] as number[]);
  const adjM = [...new Array(m)].map(_ => [] as number[]);
  const matchN = [...new Array(n)].fill(-1);
  const matchM = [...new Array(m)].fill(-1);
  const dist = [...new Array(n)].fill(-1);

  // Build adjacency matrix and its transpose
  for (const [vN, vM] of edges) {
    adjN[vN].push(vM);
    adjM[vM].push(vN);
  }

  let dmax = INF;
  
  function dfs(v: number) {
    if(v < 0) {
      return true;
    }
    for(const dst of adjN[v]) {
      const matchedSrc = matchM[dst];
      const dpu = matchedSrc >= 0 ? dist[matchedSrc] : dmax;
      if(dpu === dist[v] + 1) {
        if(dfs(matchedSrc)) {
          matchN[v] = dst;
          matchM[dst] = v;
          return true;
        }
      }
    }
    dist[v] = INF;
    return false;
  }

  // Run search
  const toVisit = [...new Array(n)];
  while(true) {

    // Initialize queue
    let count = 0
    for (let src = 0; src < n; ++src) {
      if (matchN[src] < 0) {
        dist[src] = 0;
        toVisit[count++] = src
      } else {
        dist[src] = INF;
      }
    };

    // Run breadth first search
    let ptr = 0;
    dmax = INF;
    while(ptr < count) {
      const v = toVisit[ptr++];
      const dv = dist[v];
      if(dv < dmax) {
        const adj = adjN[v];
        for(let j = 0, l = adj.length; j < l; ++j) {
          const u = adj[j];
          const pu = matchM[u];
          if(pu < 0) {
            if(dmax === INF) {
              dmax = dv + 1;
            }
          } else if(dist[pu] === INF) {
            dist[pu] = dv + 1;
            toVisit[count++] = pu;
          }
        }
      }
    }

    // Check for termination
    if(dmax === INF) {
      break;
    }

    // Run dfs on each N vertex, mutating `matchN`.
    for(let i = 0; i < n; ++i) {
      if(matchN[i] < 0) {
        dfs(i);
      }
    }
  }

  const result = matchN.reduce((agg, dst, src) =>
    agg.concat(dst < 0 ? [] : [[src, dst]]), [] as Edge[]
  );

  return result;
}
