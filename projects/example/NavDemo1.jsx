import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Poly, Vect } from "../geom";
import useUpdate from "../hooks/use-update";
import useMuState from "../hooks/use-mu-state";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";
import NPCs from "../npc/NPCs";

// TODO
// - ✅ Doors supports multiple transformed geomorphs
// - ✅ fix door interference between multiple instances of g-301--bridge

// - ✅ avoid precomputing unused transformed geometry
// - ✅ simplify relationship: Geomorph.Layout -> Geomorph.GeomorphData
// - ✅ simplify relationship: Geomorph.GeomorphData -> Geomorph.UseGeomorphsItem
// - ✅ precompute { holeIds: [infront, behind] } inside doors/windows
// - ✅ current state is [gm id, hole id]

// - ✅ can set next hole when adjacent to current
// - ✅ light propagates over geomorph boundary
// - 🚧 adjacents propagate over geomorph boundary
// - 🚧 show light polygons through doors
// - 🚧 show other doors intersecting light polygon, although cannot click
// - 🚧 GmGraph has windows

// TODO
// - 🚧 spawn from TTY
//   - ✅ symbols have points tagged 'spawn'
//   - ✅ implement spawn as shell function
//   - default spawn to 1st (in hull or first symbol with a spawn point)
//   - can specify point to spawn from
// - Andros is situated and lighting reacts

/** @param {{ disabled?: boolean }} props */
export default function NavDemo1(props) {

  const render = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-302--xboat-repair-bay' },
    // // { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
    // // { layoutKey: 'g-302--xboat-repair-bay', transform: [1, 0, 0, 1, -1200, 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [-1, 0, 0, 1, 1200 + 1200, 600] },
    // // { layoutKey: 'g-301--bridge', transform: [1, 0, 0, -1, 0, 600 + 1200 + 600], },
  ]);

  const state = useMuState(() => {
    return {
      // currentGmId: 0,
      // currentHoleId: 22,
      currentGmId: 1,
      currentHoleId: 22,
      clipPath: gms.map(_ => 'none'),

      doorsApi: /** @type {NPC.DoorsApi} */  ({ ready: false }),
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      getEnterableHoleIds() {
        const gmIndex = state.currentGmId;
        const { roomGraph } = gms[gmIndex];
        const openDoorIds = state.doorsApi.getOpen(gmIndex);
        const currentHoleNode = roomGraph.nodesArray[state.currentHoleId];
        return roomGraph.getEnterableRooms(currentHoleNode, openDoorIds).map(({ holeIndex }) => holeIndex);
      },
      onChangeDeps() {
        if (gms.length) {// Initial and HMR update
          state.update();
          const sub = state.wire
            .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
            .subscribe((_) => {
              state.update(); // Technically needn't updateObservableDoors
            });
          return () => sub.unsubscribe();
        }
      },
      update() {
        state.updateClipPath();
        state.updateObservableDoors();
        render();
      },
      updateClipPath() {
        /**
         * TODO use approach similar to `updateObservableDoors` here too
         */

        // maskPoly for current geomorph
        const { hullOutline, holesWithDoors, pngRect } = gms[state.currentGmId];
        const shownHoleIds = [state.currentHoleId].concat(state.getEnterableHoleIds());
        const holePolys = shownHoleIds.map(i => holesWithDoors[i]).filter(Boolean);
        const maskPoly = Poly.cutOut(holePolys, [hullOutline])
          .map(poly => poly.translate(-pngRect.x, -pngRect.y));

        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        state.clipPath = state.clipPath.map(_ => 'none');
        state.clipPath[state.currentGmId] = `path('${svgPaths}')`;
      },
      updateObservableDoors() {
        const gm = gms[state.currentGmId]
        const holeNode = gm.roomGraph.nodesArray[state.currentHoleId];
        /** @type {number[][]} */
        const nextObservable = gms.map(_ => []);
        nextObservable[state.currentGmId] = gm.roomGraph.getAdjacentDoors(holeNode).map(x => x.doorIndex);
        gm.roomGraph.getAdjacentHullDoorIds(gm, holeNode).map(hullDoorId => {
          const pair = gmGraph.getAdjacentPair(state.currentGmId, hullDoorId);
          pair && (nextObservable[pair.adjGmId] = [pair.adjDoorId]);
        });
        gms.forEach((_, gmId) => this.doorsApi.setObservableDoors(gmId, nextObservable[gmId]));
      },
    };
  }, [gms], {
    equality: { currentGmId: true, currentHoleId: true },
  });

  return gms.length ? (
    <CssPanZoom
      stageKey="stage-nav-demo-1"
      dark
      className={rootCss}
      zoom={0.4}
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
        onLoad={api => { state.npcsApi = api; render() }}
        disabled={props.disabled}
        stageKey="stage-nav-demo-1"
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
          outlines
          gms={gms}
          gmGraph={gmGraph}
          doorsApi={state.doorsApi}
          currentGmId={state.currentGmId}
          currentHoleId={state.currentHoleId}
          setHole={(gmId, holeId) => {
            [state.currentGmId, state.currentHoleId] = [gmId, holeId];
            state.update();
          }}
        />
      )}

      <Doors
        gms={gms}
        wire={state.wire}
        onLoad={api => state.doorsApi = api}
      />
      
    </CssPanZoom>
  ) : null;
}

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
    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);
  }
`;

/** @param {DebugProps} props   */
function Debug(props) {
  return (
    <div
      onClick={({ target }) => {
        const gmId = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-gm-index'));
        const doorId = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-door-index'));
        const gm = props.gms[gmId]
        const door = gm.doors[doorId];

        const [otherHoleId] = door.holeIds.filter(id => id !== props.currentHoleId);
        if (otherHoleId !== null) {// `door` is not a hull door
          return props.setHole(props.currentGmId, otherHoleId);
        }

        const hullDoorId = gm.hullDoors.indexOf(door);
        const pair = props.gmGraph.getAdjacentPair(gmId, hullDoorId);
        if (pair) {
          return props.setHole(pair.adjGmId, pair.holeId);
        } else {
          return console.info('hull door is isolated', gmId, hullDoorId);
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
      {props.gms.map((gm, gmIndex) => {
        const observable = props.doorsApi.getObservable(gmIndex);
        return (
          <div
            key={gm.itemKey}
            className="debug"
            style={{
              transform: gm.transformStyle,
              transformOrigin: `${gm.pngRect.x}px ${gm.pngRect.y}px`,
              position: 'absolute',
            }}
          >
            {gm.doors.map(({ poly, normal, holeIds }, doorIndex) => {
              if (observable.includes(doorIndex)) {
                const sign = holeIds[0] === props.currentHoleId ? 1 : holeIds[1] === props.currentHoleId ? -1 : 0;
                const angle = Vect.from(normal).scale(-sign || 0).angle;
                const position = poly.center.addScaledVector(normal, sign * 15);
                return (
                  <div
                    key={doorIndex}
                    data-gm-index={gmIndex}
                    data-door-index={doorIndex}
                    style={{
                      width: debugRadius * 2,
                      height: debugRadius * 2,
                      borderRadius: debugRadius,
                      position: 'absolute',
                      left: position.x - debugRadius,
                      top: position.y - debugRadius,
                      transform: `rotate(${angle}rad)`,
                      backgroundImage: "url('/icon/solid_arrow-circle-right.svg')",
                      cursor: 'pointer',
                      // filter: 'invert(100%)',
                    }}
                  />
                );
              } else {
                return null;
              }
              })}
          </div>
        )
      })}
    </div>
  );
}

const debugRadius = 4;

/**
 * @typedef DebugProps @type {object}
 * @property {Geomorph.UseGeomorphsItem[]} gms
 * @property {Graph.GmGraph} gmGraph
 * @property {NPC.DoorsApi} doorsApi
 * @property {number} currentGmId
 * @property {number} currentHoleId
 * @property {(gmId: number, holeId: number) => void} setHole
 * @property {boolean} [outlines]
 */
