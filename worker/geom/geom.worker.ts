import { persistStore } from 'redux-persist';
import { GeomWorker, GeomWorkerContext } from './worker.model';
import { GeomDispatchOverload } from './store/redux.model';
import { initializeStore } from './store/create-store';
import { GeomWorkerService } from './geom.worker.service';
import { testNever } from '@model/generic.model';
import { Polygon } from '@model/geom/polygon.model';

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
    default: throw testNever(data);
  }

});

export default {} as Worker & { new (): GeomWorker };
