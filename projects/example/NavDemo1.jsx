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
// - ✅ adjacents propagate over geomorph boundary
// - ✅ light propagates over geomorph boundary
// - ✅ show light polygons through doors
// - 🚧 cleanup approach above
// - 🚧 fix 2 hull doors issue
// - 🤔 show doors intersecting light polygon (cannot click)

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
    { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [1, 0, 0, 1, -1200, 600] },
    { layoutKey: 'g-303--passenger-deck', transform: [1, 0, 0, -1, -1200, 1200 + 600] },
    { layoutKey: 'g-302--xboat-repair-bay', transform: [-1, 0, 0, 1, 1200 + 1200, 600] },
    { layoutKey: 'g-301--bridge', transform: [1, 0, 0, -1, 0, 600 + 1200 + 600], },
  ]);

  console.log(gmGraph)

  const state = useMuState(() => {
    return {
      gmId: 0,
      holeId: 2,
      // holeId: 22,
      clipPath: gms.map(_ => 'none'),

      doorsApi: /** @type {NPC.DoorsApi} */  ({ ready: false }),
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      getEnterableHoleIds() {
        const gmIndex = state.gmId;
        const { roomGraph } = gms[gmIndex];
        const openDoorIds = state.doorsApi.getOpen(gmIndex);
        const currentHoleNode = roomGraph.nodesArray[state.holeId];
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
        const gm = gms[state.gmId]
        const maskPolys = /** @type {Poly[][]} */ (gms.map(_ => []));
        const openDoorsIds = state.doorsApi.getOpen(state.gmId);

        // Compute light polygons for current geomorph and possibly adjacent ones
        const lightPolys = gmGraph.computeLightPolygons(state.gmId, state.holeId, openDoorsIds);
        // Compute respective maskPolys
        gms.forEach((otherGm, otherGmId) => {
          const polys = lightPolys.filter(x => otherGmId === x.gmIndex).map(x => x.poly.precision(3));
          maskPolys[otherGmId] = Poly.cutOut(polys.concat(
            otherGm === gm ? gm.holesWithDoors[state.holeId] : []
          ), [otherGm.hullOutline]);
        });
        // Set the clip-paths
        maskPolys.forEach((maskPoly, gmId) => {// <img> top-left needn't be at world origin
          maskPoly.forEach(poly => poly.translate(-gms[gmId].pngRect.x, -gms[gmId].pngRect.y));
          const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
          state.clipPath[gmId] = svgPaths.length ? `path('${svgPaths}')` : 'none';
        });
      },
      updateObservableDoors() {
        const gm = gms[state.gmId]
        const holeNode = gm.roomGraph.nodesArray[state.holeId];
        const nextObservable = /** @type {number[][]} */ (gms.map(_ => []));

        nextObservable[state.gmId] = gm.roomGraph.getAdjacentDoors(holeNode).map(x => x.doorIndex);
        gm.roomGraph.getAdjacentHullDoorIds(gm, holeNode).flatMap(({ hullDoorIndex }) =>
          gmGraph.getAdjacentHoleCtxt(state.gmId, hullDoorIndex) || []
        ).forEach(({ adjGmId, adjDoorId }) => nextObservable[adjGmId] = [adjDoorId]);

        gms.forEach((_, gmId) => this.doorsApi.setObservableDoors(gmId, nextObservable[gmId]));
      },
    };
  }, [gms], {
    equality: { gmId: true, holeId: true },
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
          // outlines
          gms={gms}
          gmGraph={gmGraph}
          doorsApi={state.doorsApi}
          gmId={state.gmId}
          holeId={state.holeId}
          setHole={(gmId, holeId) => {
            [state.gmId, state.holeId] = [gmId, holeId];
            state.update();
          }}
        />
      )}

      <Doors
        gms={gms}
        wire={state.wire}
        /**
         * TODO try state.update() and avoid useLayoutEffect in Doors
         */
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
  const observable = props.doorsApi.getObservable(props.gmId);
  const gm = props.gms[props.gmId];

  return (
    <div
      onClick={({ target }) => {
        const doorId = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-door-index'));
        const gm = props.gms[props.gmId]
        const door = gm.doors[doorId];

        const [otherHoleId] = door.holeIds.filter(id => id !== props.holeId);
        if (otherHoleId !== null) {// `door` is not a hull door
          return props.setHole(props.gmId, otherHoleId);
        }

        const hullDoorId = gm.hullDoors.indexOf(door);
        const ctxt = props.gmGraph.getAdjacentHoleCtxt(props.gmId, hullDoorId);
        if (ctxt) {
          props.setHole(ctxt.adjGmId, ctxt.adjHoleId);
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
          position: 'absolute',
        }}
      >
        {gm.doors.map(({ poly, normal, holeIds }, doorIndex) => {
          if (observable.includes(doorIndex)) {
            const sign = holeIds[0] === props.holeId ? 1 : -1;
            const angle = Vect.from(normal).scale(-sign).angle;
            const position = poly.center.addScaledVector(normal, sign * debugDoorOffset);
            return (
              <div
                key={doorIndex}
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
    </div>
  );
}

const debugRadius = 4;
const debugDoorOffset = 15;

/**
 * @typedef DebugProps @type {object}
 * @property {Geomorph.UseGeomorphsItem[]} gms
 * @property {Graph.GmGraph} gmGraph
 * @property {NPC.DoorsApi} doorsApi
 * @property {number} gmId
 * @property {number} holeId
 * @property {(gmId: number, holeId: number) => void} setHole
 * @property {boolean} [outlines]
 */
