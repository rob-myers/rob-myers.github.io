import { NavWorkerContext, NavDomContract } from '@model/nav-worker.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';

const ctxt: NavWorkerContext = self as any;

ctxt.addEventListener('message', ({ data }) => {
  console.log({ navWorkerReceived: data });
  const { context } = data;  

  switch (data.key) {
    case 'ping?': {
      ctxt.postMessage({ key: 'pong!', parentKey: 'ping?', context });
      break;
    }
    case 'nav-dom?': {
      setTimeout(() => {
        const navPolys = sendNavOutline(context, data);
        setTimeout(() => sendRefinedNavMesh(context, navPolys));
      });
      break;
    }
  }
}
);

function sendNavOutline(context: string, data: NavDomContract['message']) {
  const bounds = Rect2.fromJson(data.bounds);
  const rects = data.rects.map((json) => Rect2.fromJson(json));

  // Compute navigable multipolygon
  const navPolys = Poly2.cutOut([ ...rects.map((rect) =>
    rect.outset(data.navOutset).poly2)], [bounds.poly2]);
  // Precompute triangulation before serialisation
  navPolys.forEach((poly) => poly.triangulate('standard'));

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
}
