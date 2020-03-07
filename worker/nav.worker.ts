/**
 * TODO simplify
 */
import { NavWorkerContext, NavDomContract, NavWorker } from '@model/nav/nav-worker.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { NavGraph, FloydWarshall } from '@model/nav/nav-graph.model';
import { pause } from '@model/generic.model';

const ctxt: NavWorkerContext = self as any;

interface Store {
  floydWarshall: Record<string, FloydWarshall>;
}

const store: Store = {
  floydWarshall: {},
};

ctxt.addEventListener('message', async ({ data }) => {
  console.log({ navWorkerReceived: data });
  const { context } = data;  

  switch (data.key) {
    case 'ping?': {
      ctxt.postMessage({ key: 'pong!', parentKey: 'ping?', context });
      break;
    }
    case 'nav-dom?': {
      const navPolys = sendNavOutline(context, data);
      await pause();
      const refinedPolys = sendRefinedNavMesh(context, navPolys);
      await pause();
      const navGraph = sendNavGraph(context, refinedPolys);
      await pause();
      
      // Construct floyd warshall and store here
      const fw = FloydWarshall.from(navGraph);
      store.floydWarshall[context] = fw;
      console.log({ fw });
      break;
    }
  }
}
);

function sendNavOutline(context: string, data: NavDomContract['message']) {
  const bounds = Rect2.fromJson(data.bounds);
  const rects = data.rects.map((json) => Rect2.fromJson(json));
  const spawns = data.spawns.map((json) => Rect2.fromJson(json));

  // Compute navigable multipolygon
  const sansRects = Poly2.cutOut([ ...rects.map((rect) =>
    rect.outset(data.navOutset).poly2)], [bounds.poly2]);
  // Precompute triangulation before serialisation
  sansRects.forEach((poly) => poly.triangulate('standard'));
  // Discard polys not containing some spawn point, unless debugging
  const points = spawns.map(({ center }) => center);
  const navPolys = data.debug ? sansRects
    : sansRects.filter(poly => points.some(p => poly.contains(p)));

  ctxt.postMessage({
    key: 'nav-dom:outline!',
    parentKey: 'nav-dom?',
    context,
    navPolys: navPolys.map(({ json }) => json),
  });

  return navPolys;
}

// Compute navpoly with refined triangulation.
// TODO better approach e.g. Chew's 2nd algorithm
function sendRefinedNavMesh(context: string, navPolys: Poly2[]) {
  const refinedNavPolys = navPolys.map((poly) => {
    const centers = poly.triangulation.map(({ centerOfBoundary: center }) => center);
    const nextPoly = poly.clone().addSteinerPoints(centers);
    nextPoly.triangulate('custom', { ignoreCache: true });
    return nextPoly;
  });

  ctxt.postMessage({
    key: 'nav-dom:refined!',
    parentKey: 'nav-dom?',
    context,
    refinedNavPolys: refinedNavPolys.map(({ json }) => json),
  });

  return refinedNavPolys;
}

function sendNavGraph(context: string, refinedPolys: Poly2[]) {
  const navGraph = NavGraph.from(refinedPolys);

  ctxt.postMessage({
    key: 'nav-dom:nav-graph!',
    parentKey: 'nav-dom?',
    context,
    navGraph: navGraph.json,
  });

  return navGraph;
}

export default {} as Worker & {new (): NavWorker};
