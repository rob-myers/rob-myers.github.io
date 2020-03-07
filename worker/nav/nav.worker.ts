import { NavWorkerContext, NavWorker, RequestNavData } from '@model/nav/nav.worker.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { NavGraph, FloydWarshall } from '@model/nav/nav-graph.model';

const ctxt: NavWorkerContext = self as any;

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ navWorkerReceived: msg });

  switch (msg.key) {
    case 'ping-nav': {
      ctxt.postMessage({ key: 'pong-from-nav' });
      break;
    }
    case 'request-nav-data': {
      const navPolys = sendNavOutline(msg);
      const refinedPolys = sendRefinedNavMesh(msg, navPolys);
      const navGraph = sendNavGraph(msg, refinedPolys);
      
      // Construct floyd warshall and store here
      const fw = FloydWarshall.from(navGraph);
      // store.floydWarshall[context] = fw;
      console.log({ fw });
      break;
    }
  }
});

function sendNavOutline(msg: RequestNavData) {
  const bounds = Rect2.fromJson(msg.bounds);
  const rects = msg.rects.map((json) => Rect2.fromJson(json));
  const spawns = msg.spawns.map((json) => Rect2.fromJson(json));

  // Compute navigable multipolygon
  const sansRects = Poly2.cutOut([ ...rects.map((rect) =>
    rect.outset(msg.navOutset).poly2)], [bounds.poly2]);
  // Precompute triangulation before serialisation
  sansRects.forEach((poly) => poly.triangulate('standard'));
  // Discard polys not containing some spawn point, unless debugging
  const points = spawns.map(({ center }) => center);
  const navPolys = msg.debug
    ? sansRects
    : sansRects.filter(poly => points.some(p => poly.contains(p)));

  ctxt.postMessage({
    key: 'send-nav-outline',
    navUid: msg.navUid,
    navPolys: navPolys.map(({ json }) => json),
  });
  return navPolys;
}

/**
 * Compute navpoly with refined triangulation.
 * TODO better approach e.g. Chew's 2nd algorithm
 */
function sendRefinedNavMesh(msg: RequestNavData, navPolys: Poly2[]) {
  const refinedNavPolys = navPolys.map((poly) => {
    const centers = poly.triangulation.map(({ centerOfBoundary: center }) => center);
    const nextPoly = poly.clone().addSteinerPoints(centers);
    nextPoly.triangulate('custom', { ignoreCache: true });
    return nextPoly;
  });

  ctxt.postMessage({
    key: 'send-refined-nav',
    navUid: msg.navUid,
    refinedNavPolys: refinedNavPolys.map(({ json }) => json),
  });
  return refinedNavPolys;
}

function sendNavGraph(msg: RequestNavData, refinedPolys: Poly2[]) {
  const navGraph = NavGraph.from(refinedPolys);

  ctxt.postMessage({
    key: 'send-nav-graph',
    navUid: msg.navUid,
    navGraph: navGraph.json,
  });
  return navGraph;
}

export default {} as Worker & {new (): NavWorker};
