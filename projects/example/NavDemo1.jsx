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
      gmId: 0, roomId: 2,
      // gmId: 0, roomId: 9,
      // gmId: 0, roomId: 15, // ISSUE
      // gmId: 1, roomId: 5,
      // gmId: 1, roomId: 22,
      // gmId: 2, roomId: 2,
      // gmId: 3, roomId: 26,
      /**
       * TODO better way to know door id?
       * TODO better way to know room id?
       */
      initOpen: { 0: [24] },
      clipPath: gms.map(_ => 'none'),

      doorsApi: /** @type {NPC.DoorsApi} */  ({ ready: false }),
      panZoomApi: /** @type {PanZoom.CssApi} */ ({}),
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
          if (otherGm === gm) {// Lights for current geomorph includes _current room_
            maskPolys[otherGmId] = Poly.cutOut(polys.concat(gm.roomsWithDoors[state.roomId]), [otherGm.hullOutline]);
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
        ).forEach(({ adjGmId, adjDoorId }) => (nextVis[adjGmId] = nextVis[adjGmId] || []).push(adjDoorId));

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
      initZoom={1.5}
      initCenter={{ x: 300, y: 300 }}
      dark
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

      {state.doorsApi.ready && (
        <Debug
          // outlines
          // windows
          // localNav
          showIds
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

      <NPCs
        disabled={props.disabled}
        doorsApi={state.doorsApi}
        gmGraph={gmGraph}
        npcsKey={npcsKey}
        panZoomApi={state.panZoomApi}
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

      <Doors
        gms={gms}
        gmGraph={gmGraph}
        wire={state.wire}
        initOpen={state.initOpen}
        onLoad={api => { state.doorsApi = api; render(); }}
      />
      
    </CssPanZoom>
  ) : null;
}

const npcsKey = 'npcs-demo-1';
const debugRadius = 5;
const debugDoorOffset = 18;

/** @param {Geomorph.GeomorphData} gm */
const rootCss = css`
  img {
    position: absolute;
    transform-origin: top left;
    pointer-events: none;
  }
  img.geomorph {
    filter: brightness(80%);
  }
  img.geomorph-dark {
    filter: invert(100%) brightness(34%);
    /* filter: invert(100%) brightness(55%) contrast(200%) brightness(60%); */
  }

  div.debug {
    position: absolute;
    div.debug-door-arrow {
      cursor: pointer;
      position: absolute;
      background-image: url('/icon/solid_arrow-circle-right.svg');
      border-radius: ${debugRadius}px;
    }
    div.debug-door-id-icon, div.debug-room-id-icon {
      position: absolute;
      background: black;
      color: white;
      font-size: 8px;
      line-height: 1;
      border: 1px solid black;
    }
    div.debug-room-id-icon {
      color: #4f4;
    }
    div.debug-window {
      position: absolute;
      background: #0000ff40;
      border: 1px solid white;
      pointer-events: none;
      transform-origin: top left;
    }
    svg.debug-room-nav {
      position: absolute;
      pointer-events: none;
      path.nav-poly {
        pointer-events: none;
        fill: rgba(255, 0, 0, 0.1);
        stroke: blue;
      }
    }
  }

`;

/** @param {DebugProps} props Debug current geomorph */
function Debug(props) {
  const gm = props.gms[props.gmId];
  const visDoorIds = props.doorsApi.getVisible(props.gmId);
  const roomNavPoly = gm.lazy.roomNavPoly[props.roomId];
  const roomNavAabb = roomNavPoly.rect;

  return (
    <div
      className="debug-parent"
      onClick={(e) => {
        const doorIdAttr = (/** @type {HTMLElement} */ (e.target)).getAttribute('data-debug-door-index');
        if (doorIdAttr === null) return;
        const door = gm.doors[Number(doorIdAttr)];

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
        {props.localNav && (
          <svg
            className="debug-room-nav"
            width={roomNavAabb.width}
            height={roomNavAabb.height}
            style={{
              left: roomNavAabb.x,
              top: roomNavAabb.y,
            }}
          >
            <g style={{ transform: `translate(${-roomNavAabb.x}px, ${-roomNavAabb.y}px)` }}>
              <path className="nav-poly" d={roomNavPoly.svgPath} />
            </g>
          </svg>
        )}

        {visDoorIds.map(doorId => {
          const { poly, normal, roomIds } = gm.doors[doorId];
          const sign = roomIds[0] === props.roomId ? 1 : -1;
          const angle = Vect.from(normal).scale(-sign).angle;
          const arrowPos = poly.center.addScaledVector(normal, sign * debugDoorOffset);
          const idIconPos = poly.center.addScaledVector(normal, -sign * debugDoorOffset);
          return <>
            <div
              key={doorId}
              data-debug-door-index={doorId}
              className="debug-door-arrow"
              style={{
                left: arrowPos.x - debugRadius,
                top: arrowPos.y - debugRadius,
                width: debugRadius * 2,
                height: debugRadius * 2,
                transform: `rotate(${angle}rad)`,
                // filter: 'invert(100%)',
              }}
            />
            {props.showIds && (
              <div
                key="icon"
                className="debug-door-id-icon"
                style={{ left: idIconPos.x, top: idIconPos.y - 4 }}
              >
                {doorId}
              </div>
            )}
          </>;
        })}

        {props.showIds && (
          <div
            className="debug-room-id-icon"
            style={{ left: roomNavAabb.x, top: roomNavAabb.bottom }}
          >
            {props.roomId}
          </div>
        )}

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
 * @property {boolean} [localNav]
 * @property {boolean} [showIds]
 */
