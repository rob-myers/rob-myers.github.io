declare module 'maximal-independent-set' {

  type Edge = [number, number];
  type BipartitionedSet = [number[], number[]];

  function computeMaximalIndependentSet(n: number, m: number, edges: Edge[]): BipartitionedSet;

  export default computeMaximalIndependentSet;

}
