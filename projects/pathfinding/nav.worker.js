import '@prefresh/core';
import { geom } from '../service/geom';
import { octagon, hollowOctagon, figureOfEight } from '../example/geom';

const ctx = /** @type {Worker} */ (/** @type {any} */ (self));

ctx.addEventListener('message', async (evt) => {
  console.info('worker received', evt.data);

  switch (evt.data.type) {
    case 'start': {
      ctx.postMessage({ type: 'received-start', data: null });
      
      // await geom.createNavMesh('octagon', [octagon]);
      // await geom.createNavMesh('hollow-octagon', [hollowOctagon]);
      await geom.createNavMesh('figure-of-eight', [figureOfEight]);
      return;
    }
  }
});
