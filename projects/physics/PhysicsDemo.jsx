/// <reference path="./Box2D.types.d.ts"/>
import * as React from 'react';
import Box2DFactory from '../../public/box2d/entry';

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

  return null;
}

/**
 * @typedef Physics
 * @type {object}
 * @property {Box2D.b2World} world
 * @property {number} animFrameId
 */
