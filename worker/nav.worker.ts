import { NavWorkerContext } from '@model/nav-worker.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { navOutset } from '@model/nav.model';
import { flatten } from '@model/generic.model';
// import { flatten } from '@model/generic.model';
// import { Poly2 } from '@model/poly2.model';

const ctxt: NavWorkerContext = self as any;

ctxt.addEventListener(
  'message',
  ({ data }) => {
    console.log({ navWorkerReceived: data });
    const { context } = data;
    
    switch (data.key) {
      case 'ping?': {
        ctxt.postMessage({ key: 'pong!', parentKey: 'ping?', context });
        break;
      }
      case 'nav-dom?': {
        setTimeout(() => {
          const bounds = Rect2.fromJson(data.bounds);
          const rects = data.rects.map((json) => Rect2.fromJson(json));
          const polys = data.polys.map((json) => Poly2.fromJson(json));

          // Compute navigable multipolygon
          const navPolys = Poly2.cutOut([
            ...rects.map((rect) => rect.outset(navOutset).poly2),
            ...flatten(polys.map((poly) => poly.createOutset(navOutset))),
          ], [bounds.poly2]);

          // Precompute triangulation.
          navPolys.forEach((poly) => poly.triangulate('standard'));

          ctxt.postMessage({
            key: 'nav-dom:outline!',
            parentKey: 'nav-dom?',
            context,
            navPolys: navPolys.map(({ json }) => json),
          });

          setTimeout(() => {
            // Compute navpoly with refined triangulation.
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
          });

        });
        
        break;
      }
    }
  }
);
