import Triangle from 'triangle-wasm';

const data = { pointlist: [-1, -1, 1, -1, 1, 1, -1, 1] };

Triangle.init().then(() => {
  const input = Triangle.makeIO(data);
  const output = Triangle.makeIO();
  
  Triangle.triangulate({ pslg: false, quality: true }, input, output);
  
  // draw output
  // ...
  console.log({
    input,
    output,
  });
  
  Triangle.freeIO(input, true);
  Triangle.freeIO(output);
});

// {
//   pointlist: [[0.2, -0.7764], [0.22, -0.7732] ...],
//   pointattributelist: [-0.57, -0.55, -0.51, -0.53 ...],
//   pointmarkerlist: [],
//   segmentlist: [[28, 0], [0, 1] ...],
//   segmentmarkerlist: [],
//   holelist: [[0.47, -0.5]],
//   regionlist: [],
//   numberofpoints: 29,
//   numberofpointattributes: 1,
//   numberofsegments: 29,
//   numberofholes: 1,
//   numberofregions: 0
// }