import { persistStore } from 'redux-persist';
import { GeomWorker, GeomWorkerContext } from './worker.model';
import { GeomDispatchOverload } from './store/redux.model';
import { initializeStore } from './store/create-store';
import { GeomWorkerService } from './geom.worker.service';
import { testNever } from '@model/generic.model';
import { Polygon } from '@model/geom/polygon.model';
import { RectNavGraph, navInset, navBoundsOutset } from '@model/geom/rect-nav.model';
import { Rect } from '@model/geom/rect.model';

const ctxt: GeomWorkerContext = self as any;
const store = initializeStore(ctxt);
const persistor = persistStore(store as any, null,
  // () => ctxt.postMessage({ key: 'worker-ready' }),
);

persistor.pause(); // We save manually
const _dispatch = store.dispatch as GeomDispatchOverload;

const service = new GeomWorkerService;

ctxt.addEventListener('message', async ({ data }) => {
  switch (data.key) {
    case 'request-status': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    case 'get-max-matching': {
      ctxt.postMessage({
        key: 'send-max-matching',
        graphKey: data.graphKey,
        edges: service.getMaximalMatching(data.graph),
      });
      break;
    }
    case 'get-rect-decompose': {
      const poly = Polygon.from(data.polygon);
      ctxt.postMessage({
        key: 'send-rect-decompose',
        polygonKey: data.polygonKey,
        rects: service.computeRectPartition(poly),
      });
      break;
    }
    case 'get-rect-navgraph': {
      const { tables, walls } = data.navInput;
      const rects =  tables.concat(walls).map(r => Rect.from(r));
      const rectPolys = rects.map(r => Polygon.fromRect(r));
      const boundsRect = Rect.union(rects).outset(navBoundsOutset);
      const inverses = service.cutOut(rectPolys, [Polygon.fromRect(boundsRect)]);
      // TODO remove hardcoded inset amount
      const insets = inverses.flatMap(poly => service.inset(poly, navInset));
      const rectGrps = insets.map(poly => service.computeRectPartition(poly));
      const navGraphs = rectGrps.map(rects => (new RectNavGraph(rects).compute()));

      ctxt.postMessage({
        key: 'send-rect-navgraph',
        graphKey: data.graphKey,
        navGraphs: navGraphs.map(x => x.json),
      });
      break;
    }
    default: throw testNever(data);
  }

});

export default {} as Worker & { new (): GeomWorker };
