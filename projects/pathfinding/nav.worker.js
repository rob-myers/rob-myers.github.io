import '@prefresh/core';
import { Poly } from '../geom';
import { GeoJsonPolygon } from '../geom/types';
import { geom } from '../service/geom';

const ctx = /** @type {Worker} */ (/** @type {any} */ (self));

ctx.addEventListener('message', async (evt) => {
  console.info('nav worker received', evt.data);

  switch (evt.data.type) {
    case 'ping':
      ctx.postMessage({ type: 'pong' });
      return;
    case 'create': {
      const { navKey, navPolys: polysJson, walkableRadius } = evt.data;
      const navPolys = polysJson.map(Poly.from);
      await geom.createNavMesh(navKey, navPolys, walkableRadius);
      return; 
    }
    case 'path': {
      const { navKey, src, dst } = evt.data;
      const path = geom.requestNavPath(navKey, src, dst);
      ctx.postMessage({ type: 'path', path });
      return; 
    }
  }
});
