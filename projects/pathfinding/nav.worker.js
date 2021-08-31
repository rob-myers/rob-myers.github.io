/**
 * TODO
 * - remove recast-detour
 * - use this worker to store navmeshes and find paths
 */
import '@prefresh/core';
import { Poly } from '../geom';
import { geom, recast } from '../service';

const ctx = /** @type {Worker} */ (/** @type {any} */ (self));

ctx.addEventListener('message', async (evt) => {
  console.info('nav worker received', evt.data);

  switch (evt.data.type) {
    case 'ping':
      ctx.postMessage({ type: 'pong' });
      return;
    case 'create':
    case 'debug': {
      const { navKey, navPolys: polysJson, walkableRadius } = evt.data;
      const navPolys = polysJson.map(Poly.from);
      await geom.createNavMesh(navKey, navPolys, walkableRadius);
      const debug = evt.data.type === 'debug' ? recast.getDebugTriangulation(navKey) : undefined;
      ctx.postMessage({ type: 'created', navKey, debug });
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
