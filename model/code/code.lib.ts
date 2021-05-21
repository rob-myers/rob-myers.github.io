export const initialCode = {

  'file.js@demo': `

function clear({stage:{root}}) {
  root.children.slice().forEach(child => root.remove(child));
}

function cube({stage:{root}, lib:{THREE}, args}) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: new THREE.Color("#0000ff")}),
  );
  cube.position.setY(0.5);
  cube.name = args[0] || "TempCube";
  root.add(cube);
}

function light({stage:{root}, lib:{THREE}}) {
  const light = new THREE.DirectionalLight;
  light.position.set(-1, 3, 2);
  light.lookAt(0, 0, 0);
  light.name = "TempLight";
  root.add(light);
}

async function readIntoVar({ args, var: v, api }) {
  if (args[0]) {
    v[args[0]] = await api.read();
  }
}

function *testYield(pr) {
  yield* ["process context:", pr];
}

async function *testYieldRead({ api }) {
  const value = await api.read();
  yield "the following was read:";
  yield value;
}

class Util {
  static sum(a, b) {
    return a + b;
  }
}  
`.trim(),

};