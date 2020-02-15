import { NavWorker } from '@model/nav-worker.model';
// import { navOutset } from '@model/nav.model';
// import { flatten } from '@model/generic.model';
// import { Poly2 } from '@model/poly2.model';

const ctxt: NavWorker = self as any;

ctxt.addEventListener(
  'message',
  ({ data }) => {
    console.log({ navWorkerReceived: data });

    switch (data.key) {
      case 'ping?': {
        ctxt.postMessage({ key: 'pong!' });
        break;
      }
      // case 'triangulate': {
      //   const { poly2 } = data;
      //   poly2.triangulate('custom');
      //   ctxt.postMessage({ key: 'triangulated', poly2 });
      //   break;
      // }
      // Compute navigable multipolygon
      case 'nav-dom?': {
        // const { bounds, polys, rects } = data;
        // const navPolys = Poly2.cutOut([
        //   ...rects.map((rect) => rect.outset(navOutset).poly2),
        //   ...flatten(polys.map((poly) => poly.createOutset(navOutset))),
        // ], [bounds.poly2]);
        // ctxt.postMessage({ key: 'nav-multipoly', navPolys });
        break;
      }
    }
  }
);
