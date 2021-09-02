/// <reference path="./Box2D.types.d.ts"/>
import * as React from 'react';
import { Rect } from '../geom';
import Box2DFactory from '../../public/box2d/entry';
import PanZoom from '../panzoom/PanZoom';

export default function PhysicsDemo() {
  
  const p = React.useRef(/** @type {Physics} */ ({})).current;

  React.useEffect(() => {

    Box2DFactory({
      locateFile: (filename, _url) => `/box2d/${filename}`,
    }).then(box2D => {
      const gravity = new box2D.b2Vec2(0, 0);
      p.world = new box2D.b2World(gravity);
      console.info('created world', p);
    });

    return () => {
      console.info('destroying world');
      p.world?.__destroy__();
      Object.assign(p, { world: null });
    };
  }, []);

  return (
    <PanZoom gridBounds={gridBounds} initViewBox={initViewBox}>
      <text x={10} y={20}>TODO</text>
    </PanZoom>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);

/**
 * @typedef Physics
 * @type {object}
 * @property {Box2D.b2World} world
 * @property {number} animFrameId
 */
