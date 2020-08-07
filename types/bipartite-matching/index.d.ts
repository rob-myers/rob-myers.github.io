declare module 'bipartite-matching' {

  type Edge = [number, number];

  function computeMaximalMatching(n: number, m: number, edges: Edge[]): Edge[];

  export default computeMaximalMatching;

}
