import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Poly } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { assertDefined } from "../service/generic";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphs from "../hooks/use-geomorphs";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";

/** @param {{ disabled?: boolean }} props */
export default function LightsTest(props) {

  const update = useUpdate();

  const { gms, gmGraph } = useGeomorphs([
    { layoutKey: 'g-101--multipurpose' },
  ]);

  const gm = gms[0];

  const state = useStateRef(() => {
    return {
      clipPath: 'none',
      doorsApi: /** @type {NPC.DoorsApi} */ ({}),
      roomShown: /** @type {{ [roomId: number]: true }} */ ({
        0: true,
        2: true,
      }),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /** @param {React.MouseEvent<HTMLDivElement>} param0  */
      onToggleLight({ target }) {
        const dataIndex = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-index'));
        dataIndex in state.roomShown ? delete state.roomShown[dataIndex] : state.roomShown[dataIndex] = true;
        state.updateMasks();
      },

      updateMasks(delayUpdate = 0) {
        const {
          pngRect, hullOutline, roomsWithDoors,
          roomGraph,
        } = assertDefined(gm);

        const rootRoomIds = Object.keys(state.roomShown).map(Number);
        const openDoorIds = state.doorsApi.getOpen(0);

        // lights through doors and windows
        const lightPolygons = rootRoomIds.flatMap((srcRoomId) =>
          gmGraph.computeLightPolygons(0, srcRoomId, openDoorIds)
        );

        const allRoomPolys = rootRoomIds
          .map(id => roomsWithDoors[id]) // Each root contribs holeWithDoor
          .concat(lightPolygons.map(x => x.poly)) // Each open door contribs a light polygon
          .map(x => x.precision(2));

        const observableDoors = roomGraph.getAdjacentDoors(...rootRoomIds.map(id => roomGraph.nodesArray[id]));
        this.doorsApi.setVisible(0, observableDoors.map(x => x.doorId));
        const maskPoly = Poly.cutOut(allRoomPolys, [hullOutline],)
          .map(poly => poly.translate(-pngRect.x, -pngRect.y));
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        update();

        setTimeout(() => {// We delay mask update when closing doors
          state.clipPath = `path('${svgPaths}')`;
          update();
        }, delayUpdate);
      },
    };
  }, { overwrite: { roomShown: true }, deps: [gm] });

  React.useEffect(() => {
    if (gm) {
      // Ensure consistency on switch geomorphs
      for (const roomId of Object.keys(state.roomShown).map(Number)) {
        if (!gm.rooms[roomId]) delete state.roomShown[roomId];
      }
      // Initial update
      state.updateMasks();
      const sub = state.wire
        .pipe(filter(x => x.key === 'closed-door' || x.key === 'opened-door'))
        .subscribe((x) => state.updateMasks(x.key === 'closed-door' ? 300 : 0));
      return () => sub.unsubscribe();
    }
  }, [gm]);

  return (
    <CssPanZoom dark className={rootCss}>
      {gm && <>

        <img
          className="geomorph"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            width: gm.pngRect.width,
            height: gm.pngRect.height,
          }}
        />

        <img
          className="geomorph-dark"
          src={geomorphPngPath(gm.key)}
          draggable={false}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            width: gm.pngRect.width,
            height: gm.pngRect.height,
            clipPath: state.clipPath,
            WebkitClipPath: state.clipPath,
          }}
        />

        <div
          className="light-toggles"
          onClick={state.onToggleLight}
        >
          {gm.roomsSwitch.map((center, roomId) => {
            return <div
              key={roomId}
              data-index={roomId}
              className="toggle"
              style={{
                left: center.x - 5,
                top: center.y - 5,
                borderColor: state.roomShown[roomId] ? '#5f5' : 'rgba(200, 0, 0, 0.3)',
                outline: state.roomShown[roomId] ? '1px solid black' : '1px solid rgba(255, 255, 255, 0.5)',
              }}
            />
          })}
        </div>

        <Doors
          gms={gms}
          gmGraph={gmGraph}
          wire={state.wire}
          onLoad={api => state.doorsApi = api}
          initOpen={{}}
        />

        {/* <DebugGraph gm={gm} /> */}

      </>}
    </CssPanZoom>
  );
}

const rootCss = css`
  img.geomorph-dark {
    position: absolute;
    filter: invert(100%) brightness(45%) contrast(200%) sepia(0%) hue-rotate(0deg) blur(0px);
  }
  img.geomorph {
    position: absolute;
    filter: brightness(65%) sepia(50%) hue-rotate(180deg);
  }
  div.light-toggles {
    position: absolute;

    div.toggle {
      border-radius: 5px;
      border: 5px solid white;
      position: absolute;
      cursor: pointer;
    }
  }
  svg.room-graph {
    position: absolute;
    pointer-events: none;
    circle, line {
      pointer-events: none;
    }
  }
`;

/** @param {{ gm: Geomorph.GeomorphData }} props */
function DebugGraph({ gm }) {
  return (
    <svg
      className="room-graph"
      width={gm.pngRect.width}
      height={gm.pngRect.height}
    >
      {gm.roomGraph.nodesArray.map((node, i) =>
        <circle
          key={i}
          stroke="rgba(200, 0, 0, 1)"
          fill="none"
          r={5}
          {...node.type === 'room'
            && { cx: gm.roomsSwitch[i].x, cy: gm.roomsSwitch[i].y,  }}
          {...node.type === 'door'
            && { cx: gm.doors[node.doorId].poly.center.x, cy: gm.doors[node.doorId].poly.center.y }}
          {...node.type === 'window'
            && { cx: gm.doors[node.windowIndex].poly.center.x, cy: gm.windows[node.windowIndex].poly.center.y }}
        />
        )}
        {gm.rooms.map((poly) =>
          <path
            fill="none"
            stroke="yellow"
            d={poly.svgPath}
          />
        )}
        {gm.roomGraph.edgesArray
          .filter((x) => x.src.type === 'room' && x.dst.type === 'door')
          .map((edge) =>
            <line
              stroke="red"
              x1={gm.roomsSwitch[
                /** @type {Graph.RoomGraphNodeRoom} */ (edge.src).roomId].x}
              y1={gm.roomsSwitch[
                /** @type {Graph.RoomGraphNodeRoom} */ (edge.src).roomId].y}
              x2={gm.doors[
                /** @type {Graph.RoomGraphNodeDoor} */ (edge.dst).doorId].poly.center.x}
              y2={gm.doors[
                /** @type {Graph.RoomGraphNodeDoor} */  (edge.dst).doorId].poly.center.y}
            />
        )}
    </svg>
  );
}