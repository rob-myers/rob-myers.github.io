import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Vect } from "../geom";
import useUpdate from "../hooks/use-update";
import useStateRef from "../hooks/use-state-ref";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";

// TODO
// - 🚧 spawn from TTY
//   - ✅ symbols have points tagged 'spawn'
//   - ✅ implement spawn as shell function
//   - ✅ NPCs -> NPCsTest and create fresh NPCs
//   - ✅ NPCs listens for "spawn" event and creates NPC
//   - ✅ NPCs ensures local pathfinding data
//   - ✅ can get local navpath via shell function
//   - ✅ can plot a local navpath
//   - ✅ navpath takes doors into account
//   - 🚧 global navpath
// - Andros is situated and lighting reacts
// - 🤔 show doors intersecting light polygon (cannot click)

/** @param {{ disabled?: boolean }} props */
export default function NavDemo1(props) {

  const render = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [1, 0, 0, 1, -1200, 600] },
    { layoutKey: 'g-303--passenger-deck', transform: [1, 0, 0, -1, -1200, 1200 + 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [-1, 0, 0, 1, 1200 + 1200, 600] },
    { layoutKey: 'g-301--bridge', transform: [1, 0, 0, -1, 0, 600 + 1200 + 600], },
  ]);

  // gmGraph && console.log(gmGraph)

  const state = useStateRef(() => {
    return {
      // gmId: 0,
      // roomId: 2,
      // roomId: 16,
      // gmId: 1,
      // roomId: 5,
      // roomId: 22,
      gmId: 2,
      roomId: 2,
      // gmId: 3,
      // roomId: 26,   
      clipPath: gms.map(_ => 'none'),

      doorsApi: /** @type {NPC.DoorsApi} */  ({ ready: false }),
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      panZoomApi: /** @type {PanZoom.CssExtApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      update() {
        state.updateClipPath();
        state.updateVisibleDoors();
        render();
      },
      updateClipPath() {
        const gm = gms[state.gmId]
        const maskPolys = /** @type {Poly[][]} */ (gms.map(_ => []));
        const openDoorsIds = state.doorsApi.getOpen(state.gmId);

        // Compute light polygons for current geomorph and possibly adjacent ones
        const lightPolys = gmGraph.computeLightPolygons(state.gmId, state.roomId, openDoorsIds);
        // Compute respective maskPolys
        gms.forEach((otherGm, otherGmId) => {
          const polys = lightPolys.filter(x => otherGmId === x.gmIndex).map(x => x.poly.precision(2));
          if (otherGm === gm) {// Lights for current geomorph includes _current room_ without holes
            const sansHoles = new Poly(gm.roomsWithDoors[state.roomId].outline);
            maskPolys[otherGmId] = Poly.cutOut(polys.concat(sansHoles), [otherGm.hullOutline]);
          } else {
            maskPolys[otherGmId] = Poly.cutOut(polys, [otherGm.hullOutline]);
          }
        });
        // Set the clip-paths
        maskPolys.forEach((maskPoly, gmId) => {// <img> top-left needn't be at world origin
          maskPoly.forEach(poly => poly.translate(-gms[gmId].pngRect.x, -gms[gmId].pngRect.y));
          const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
          state.clipPath[gmId] = svgPaths.length ? `path('${svgPaths}')` : 'none';
        });
      },
      updateVisibleDoors() {
        const gm = gms[state.gmId]
        const roomNode = gm.roomGraph.nodesArray[state.roomId];

        /** Visible doors in current geomorph and possibly hull doors from other geomorphs */
        const nextVis = /** @type {number[][]} */ (gms.map(_ => []));
        nextVis[state.gmId] = gm.roomGraph.getAdjacentDoors(roomNode).map(x => x.doorId);
        gm.roomGraph.getAdjacentHullDoorIds(gm, roomNode).flatMap(({ hullDoorIndex }) =>
          gmGraph.getAdjacentRoomCtxt(state.gmId, hullDoorIndex) || []
        ).forEach(({ adjGmId, adjDoorId }) => nextVis[adjGmId] = [adjDoorId]);

        gms.forEach((_, gmId) => this.doorsApi.setVisible(gmId, nextVis[gmId]));
      },
    };
  }, {
    overwrite: { gmId: true, roomId: true },
    deps: [gms, gmGraph],
  });

  React.useEffect(() => {
    if (gms.length && state.doorsApi.ready) {
      state.update();
      const sub = state.wire
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe((_) => {
          state.update(); // Technically needn't updateObservableDoors
        });
      return () => sub.unsubscribe();
    }
  }, [gms, state.doorsApi.ready]);

  return gms.length ? (
    <CssPanZoom
      className={rootCss}
      zoom={0.4}
      dark
      wireKey={wireKey}
      onLoad={api => state.panZoomApi = api}
    >
      {gms.map(gm =>
        <img
          className="geomorph"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            transform: gm.transformStyle,
            transformOrigin: gm.transformOrigin,
          }}
        />
      )}

      <NPCs
        disabled={props.disabled}
        doorsApi={state.doorsApi}
        gmGraph={gmGraph}
        panZoomApi={state.panZoomApi}
        wireKey={wireKey}
      />

      {gms.map((gm, gmIndex) =>
        <img
          key={gmIndex}
          className="geomorph-dark"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          width={gm.pngRect.width}
          height={gm.pngRect.height}
          style={{
            clipPath: state.clipPath[gmIndex],
            WebkitClipPath: state.clipPath[gmIndex],
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            transform: gm.transformStyle,
            transformOrigin: gm.transformOrigin,
          }}
        />
      )}

      {state.doorsApi.ready && (
        <Debug
          // outlines
          // windows
          gms={gms}
          gmGraph={gmGraph}
          doorsApi={state.doorsApi}
          gmId={state.gmId}
          roomId={state.roomId}
          setRoom={(gmId, roomId) => {
            [state.gmId, state.roomId] = [gmId, roomId];
            state.update();
          }}
        />
      )}

      <Doors
        gms={gms}
        gmGraph={gmGraph}
        wire={state.wire}
        onLoad={api => { state.doorsApi = api; render(); }}
      />
      
    </CssPanZoom>
  ) : null;
}

const wireKey = 'wire-demo-1';
const debugRadius = 5;
const debugDoorOffset = 18;

/** @param {Geomorph.GeomorphData} gm */
const rootCss = css`
  img {
    position: absolute;
    transform-origin: top left;
  }
  img.geomorph {
    filter: brightness(80%);
  }
  img.geomorph-dark {
    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%) hue-rotate(0deg);
  }

  div.debug {
    position: absolute;
    div.debug-door {
      cursor: pointer;
      position: absolute;
      background-image: url('/icon/solid_arrow-circle-right.svg');
      border-radius: ${debugRadius}px;
    }
    div.debug-window {
      position: absolute;
      background: #0000ff40;
      border: 1px solid white;
    }
  }

`;

/** @param {DebugProps} props Debug current geomorph */
function Debug(props) {
  const gm = props.gms[props.gmId];
  const visDoorIds = props.doorsApi.getVisible(props.gmId);

  return (
    <div
      onClick={({ target }) => {
        const doorId = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-door-index'));
        const door = gm.doors[doorId];

        const [otherRoomId] = door.roomIds.filter(id => id !== props.roomId);
        if (otherRoomId !== null) {// `door` is not a hull door
          return props.setRoom(props.gmId, otherRoomId);
        }

        const hullDoorId = gm.hullDoors.indexOf(door);
        const ctxt = props.gmGraph.getAdjacentRoomCtxt(props.gmId, hullDoorId);
        if (ctxt) {
          props.setRoom(ctxt.adjGmId, ctxt.adjRoomId);
        } else {
          console.info('hull door is isolated', props.gmId, hullDoorId);
        }
      }}
    >
      {props.outlines && props.gms.map((gm, gmIndex) =>
        <div
          key={gmIndex}
          style={{
            position: 'absolute',
            left: gm.gridRect.x,
            top: gm.gridRect.y,
            width: gm.gridRect.width,
            height: gm.gridRect.height,
            border: '2px red solid',
          }}
        />  
      )}
      <div
        key={gm.itemKey}
        className="debug"
        style={{
          transform: gm.transformStyle,
        }}
      >
        {visDoorIds.map(doorId => {
          const { poly, normal, roomIds } = gm.doors[doorId];
          const sign = roomIds[0] === props.roomId ? 1 : -1;
          const angle = Vect.from(normal).scale(-sign).angle;
          const position = poly.center.addScaledVector(normal, sign * debugDoorOffset);
          return (
            <div
              key={doorId}
              data-door-index={doorId}
              className="debug-door"
              style={{
                left: position.x - debugRadius,
                top: position.y - debugRadius,
                width: debugRadius * 2,
                height: debugRadius * 2,
                transform: `rotate(${angle}rad)`,
                // filter: 'invert(100%)',
              }}
            />
          );
        })}

        {props.windows && gm.windows.map(({ rect, angle }, i) => {
          return (
            <div
              key={`window-${i}`}
              className="debug-window"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                transform: `rotate(${angle}rad)`,
                transformOrigin: 'top left',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * @typedef DebugProps @type {object}
 * @property {Geomorph.GeomorphDataInstance[]} gms
 * @property {Graph.GmGraph} gmGraph
 * @property {NPC.DoorsApi} doorsApi
 * @property {number} gmId
 * @property {number} roomId
 * @property {(gmId: number, roomId: number) => void} setRoom
 * @property {boolean} [outlines]
 * @property {boolean} [windows]
 */
