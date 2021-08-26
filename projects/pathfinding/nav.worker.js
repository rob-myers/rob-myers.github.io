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
      const navKey = evt.data.navKey;
      const polysJson = /** @type {GeoJsonPolygon[]} */ (evt.data.navPolys);
      const navPolys = polysJson.map(Poly.from);
      await geom.createNavMesh(navKey, navPolys);
      return; 
    }
  }
});
