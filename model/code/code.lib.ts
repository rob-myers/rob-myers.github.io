export const initialCode = {

  'file.js@demo': `
function testLog(ctxt) {
  console.log("process context", ctxt);
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