import React from "react";
import { Poly } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";

/**
 * Field Of View i.e. the dark part of geomorphs 
 * Styled earlier e.g. position absolute and inverted.
 * @param {Props} props 
 */
export default function FOV(props) {

  const { gmGraph, gmGraph: { gms } } = props;

  const update = useUpdate();

  const state = useStateRef(/** @type {() => State} */ () => ({
    gmId: 0,
    roomId: 9,
    // gmId: 0, roomId: 2,
    // gmId: 0, roomId: 15, // ISSUE
    // gmId: 1, roomId: 5,
    // gmId: 1, roomId: 22,
    // gmId: 2, roomId: 2,
    // gmId: 3, roomId: 26,

    clipPath: gms.map(_ => 'none'),
    ready: true,

    setRoom(gmId, roomId) {
      if (state.gmId !== gmId || state.roomId !== roomId) {
        state.gmId = gmId;
        state.roomId = roomId;
        update();
        return true;
      } else {
        return false;
      }
    },
    updateClipPath() {
      const gm = gms[state.gmId]
      const openDoorsIds = props.doorsApi.getOpen(state.gmId);
      /**
       * Compute light polygons for current geomorph and possibly adjacent ones
       */
      const lightPolys = gmGraph.computeLightPolygons(state.gmId, state.roomId, openDoorsIds);
      /**
       * Compute mask polygons:
       * - current room include roomWithDoor
       * - compute darkness by cutting light from hullPolygon
       */
      const maskPolys = /** @type {Poly[][]} */ (gms.map(_ => []));
      gms.forEach((otherGm, otherGmId) => {
        const polys = lightPolys.filter(x => otherGmId === x.gmIndex).map(x => x.poly.precision(2));
        if (otherGm === gm) {// Lights for current geomorph includes _current room_
          const roomWithDoors = gm.roomsWithDoors[state.roomId]
          // Cut one-by-one prevents Error like https://github.com/mfogel/polygon-clipping/issues/115
          maskPolys[otherGmId] = polys.concat(roomWithDoors).reduce((agg, cutPoly) => Poly.cutOut([cutPoly], agg), [otherGm.hullOutline])
          // maskPolys[otherGmId] = Poly.cutOut(polys.concat(roomWithDoors), [otherGm.hullOutline]);
        } else {
          maskPolys[otherGmId] = Poly.cutOut(polys, [otherGm.hullOutline]);
        }
      });
      /**
       * Finally, convert masks into a CSS format.
       */
      maskPolys.forEach((maskPoly, gmId) => {// <img> top-left needn't be at world origin
        maskPoly.forEach(poly => poly.translate(-gms[gmId].pngRect.x, -gms[gmId].pngRect.y));
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        state.clipPath[gmId] = svgPaths.length ? `path('${svgPaths}')` : 'none';
      });
    },
  }), {
    overwrite: { gmId: true, roomId: true },
    deps: [gms, gmGraph],
  });

  React.useMemo(() => {
    props.onLoad(state);
  }, []);

  return <>
    {gms.map((gm, gmId) =>
      <img
        key={gmId}
        className="geomorph-dark"
        src={geomorphPngPath(gm.key)}
        draggable={false}
        width={gm.pngRect.width}
        height={gm.pngRect.height}
        style={{
          clipPath: state.clipPath[gmId],
          WebkitClipPath: state.clipPath[gmId],
          left: gm.pngRect.x,
          top: gm.pngRect.y,
          transform: gm.transformStyle,
          transformOrigin: gm.transformOrigin,
        }}
      />
    )}
  </>;
}

/**
 * @typedef Props @type {object}
 * @property {NPC.DoorsApi} doorsApi
 * @property {Graph.GmGraph} gmGraph
 * @property {(fovApi: State) => void} onLoad
 */

/**
 * @typedef State @type {object}
 * @property {number} gmId
 * @property {boolean} ready
 * @property {number} roomId
 * @property {string[]} clipPath
 * @property {(gmId: number, roomId: number) => boolean} setRoom
 * @property {() => void} updateClipPath
 */
