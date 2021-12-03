declare module '*build/Release/RecastCLI' {
  
  function loadFile(objFilepath: string);
  function loadArray(vs: Float32Array, ids:  Int32Array);
  function loadContent(atDelimitedEncoding: string);

  function build(
    cellSize: number,
    cellHeight: number,
    agentHeight: number,
    agentRadius: number,
    agentMaxClimb: number,
    agentMaxSlope: number,
    regionMinSize: number,
    regionMergeSize: number,
    edgeMaxLen: number,
    edgeMaxError: number,
    vertsPerPoly: number,
    detailSampleDist: number,
    detailSampleMaxErro: number,
  ): string;

  function save(objFilepath);
}