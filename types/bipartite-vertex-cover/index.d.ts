declare module 'bipartite-vertex-cover' {

  type Edge = [number, number];
  type BipartitionedSet = [number[], number[]];

  function computeMinimalVertexCover(n: number, m: number, edges: Edge[]): BipartitionedSet;

  export default computeMinimalVertexCover;

}
