import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Mat, Poly, Vect } from "../geom";
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
// - 🚧 simplify relationship:
//      Geomorph.Layout -> Geomorph.GeomorphData -> Geomorph.UseGeomorphsItem
// - 🚧 precompute { holeIds: [infront, behind] } inside doors/windows

// - 🚧 can set next hole when adjacent to current
// - 🚧 current state is [gm id, hole id]
// - 🚧 light propagates over geomorph boundary
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

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-301--bridge' },
    { layoutKey: 'g-101--multipurpose', transform: [1, 0, 0, 1, 0, 600] },
    { layoutKey: 'g-301--bridge', transform: [1, 0, 0, -1, 0, 600 + 1200 + 600], },
  ]);

  const state = useMuState(() => {
    return {
      currentGmIndex: 0,
      currentHoleId: 2,
      clipPath: gms.map(_ => 'none'),

      doorsApi: /** @type {NPC.DoorsApi} */  ({ ready: false }),
      npcsApi: /** @type {NPC.NPCsApi} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /**
       * TODO need adjacent holes from other geomorphs sometimes
       */
      getAdjacentHoleIds() {
        const gmIndex = state.currentGmIndex;
        const { roomGraph } = gms[gmIndex];
        const openDoorIds = state.doorsApi.getOpen(gmIndex);
        const currentRoomNode = roomGraph.nodesArray[state.currentHoleId];
        return roomGraph.getEnterableRooms(currentRoomNode, openDoorIds).map(({ holeIndex }) => holeIndex);
      },
      onChangeDeps() {
        if (gms.length) {// Initial and HMR update
          state.updateClipPath();
          state.updateObservableDoors();
          update();
          const sub = state.wire
            .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
            .subscribe((_) => {
              state.updateClipPath();
              update();
            });
          return () => sub.unsubscribe();
        }
      },
      updateClipPath() {
        const gmIndex = state.currentGmIndex;
        const gm = gms[gmIndex];
        const { gm: { d: { hullOutline, holesWithDoors }} } = gm;
        const shownHoleIds = [state.currentHoleId].concat(state.getAdjacentHoleIds());
        const holePolys = shownHoleIds.map(i => holesWithDoors[i]);
        const maskPoly = Poly.cutOut(holePolys, [hullOutline])
          .map(poly => poly.translate(-gm.gm.d.pngRect.x, -gm.gm.d.pngRect.y));
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        state.clipPath = state.clipPath.map(_ => 'none');
        state.clipPath[gmIndex] = `path('${svgPaths}')`;
      },
      updateObservableDoors() {
        const gmIndex = state.currentGmIndex;
        const gm = gms[gmIndex];
        const { roomGraph } = gm;
        const currentRoomNode = roomGraph.nodesArray[state.currentHoleId];
        const observableDoors = roomGraph.getAdjacentDoors(currentRoomNode);
        gms.forEach((_, otherGmIndex) => this.doorsApi.setObservableDoors(
          otherGmIndex,
          gmIndex === otherGmIndex ? observableDoors.map(x => x.doorIndex) : []
        ));
      },
    };
  }, [gms], {
    equality: { currentGmIndex: true, currentHoleId: true },
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
          src={geomorphPngPath(gm.gm.key)}
          draggable={false}
          width={gm.gm.d.pngRect.width}
          height={gm.gm.d.pngRect.height}
          style={{
            left: gm.gm.d.pngRect.x,
            top: gm.gm.d.pngRect.y,
            transform: `matrix(${gm.transform})`,
            transformOrigin: `${-gm.gm.d.pngRect.x}px ${-gm.gm.d.pngRect.y}px`,
          }}
        />
      )}

      <NPCs
        onLoad={api => { state.npcsApi = api; update() }}
        disabled={props.disabled}
        stageKey="stage-nav-demo-1"
      />

      {gms.map((gm, gmIndex) =>
        <img
          key={gmIndex}
          className="geomorph-dark"
          src={geomorphPngPath(gm.gm.key)}
          draggable={false}
          width={gm.gm.d.pngRect.width}
          height={gm.gm.d.pngRect.height}
          style={{
            clipPath: state.clipPath[gmIndex],
            WebkitClipPath: state.clipPath[gmIndex],
            left: gm.gm.d.pngRect.x,
            top: gm.gm.d.pngRect.y,
            transform: `matrix(${gm.transform})`,
            transformOrigin: `${-gm.gm.d.pngRect.x}px ${-gm.gm.d.pngRect.y}px`,
          }}
        />
      )}

      {state.doorsApi.ready && <Debug gms={gms} doorsApi={state.doorsApi} currentHoleId={state.currentHoleId} />}

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

/** @param {{ gms: Geomorph.UseGeomorphsItem[]; doorsApi: NPC.DoorsApi; currentHoleId: number }} props   */
function Debug(props) {
  return <>
    {props.gms.map((gm, gmIndex) =>
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
            transformOrigin: `${gm.gm.d.pngRect.x}px ${gm.gm.d.pngRect.y}px`,
            position: 'absolute',
          }}
        >
          {gm.gm.doors.map(({ poly, normal }, doorIndex) => {
            if (observable.includes(doorIndex)) {
              const sign = gm.roomGraph.getRoomDoorSign(props.currentHoleId, doorIndex) || 0;
              const angle = Vect.from(normal).scale(-sign || 0).angle;
              const position = poly.center.addScaledVector(normal, sign * 15);
              return (
                <div
                  key={doorIndex}
                  style={{
                    width: debugRadius * 2,
                    height: debugRadius * 2,
                    borderRadius: debugRadius,
                    position: 'absolute',
                    left: position.x - debugRadius,
                    top: position.y - debugRadius,
                    transform: `rotate(${angle}rad)`,
                    backgroundImage: "url('/icon/solid_arrow-circle-right.svg')",
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
  </>;
}

const debugRadius = 4;
