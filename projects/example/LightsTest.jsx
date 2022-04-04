import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { Poly } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { assertDefined } from "../service/generic";
import { geom } from "../service/geom";
import { geomorphDataToGeomorphsItem } from "../service/geomorph";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "../hooks/use-update";
import CssPanZoom from "../panzoom/CssPanZoom";
import Doors from "../geomorph/Doors";

/** @param {{ disabled?: boolean }} props */
export default function LightsTest(props) {

  const { data: gm } = useGeomorphData(layoutKey);
  const update = useUpdate();

  const state = useMuState(() => {
    return {
      clipPath: 'none',
      doorsApi: /** @type {NPC.DoorsApi} */ ({}),
      isHoleShown: /** @type {{ [holeIndex: string]: true }} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),

      /** @param {React.MouseEvent<HTMLDivElement>} param0  */
      onToggleLight({ target }) {
        const dataIndex = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-index'));
        dataIndex in state.isHoleShown ? delete state.isHoleShown[dataIndex] : state.isHoleShown[dataIndex] = true;
        state.updateMasks();
      },

      updateMasks(delayMask = 0) {
        const {
          d: {pngRect, hullOutline, holesWithDoors, roomGraph},
          doors,
        } = assertDefined(gm);

        const rootHoleIds = Object.keys(state.isHoleShown).map(Number);
        const openDoorIds = state.doorsApi.getOpen();

        // TODO 🚧 windows have light polygons too
        // AdjHoles contribute a light polygon
        const lightPolygons = rootHoleIds.flatMap((srcHoleId) => {
          const roomNode = roomGraph.nodesArray[srcHoleId];
          const adjOpenDoorIds = roomGraph.getAdjacentDoors(roomNode).map(x => x.doorIndex).filter(id => openDoorIds.includes(id));
          // NOTE adjacent closed doors insufficient
          const closedDoorPolys = doors.flatMap((door, id) => !adjOpenDoorIds.includes(id) ? door.poly : []);

          return adjOpenDoorIds.map(doorIndex => {
            const door = doors[doorIndex];
            const adjRoomNodes = roomGraph.getAdjacentRooms(roomGraph.getDoorNode(doorIndex));
            const roomSign = roomGraph.getRoomSign(srcHoleId, doorIndex);
            if (roomSign === null)
              console.warn(`hole ${srcHoleId}: door ${doorIndex}: roomSign is null`);
            const lightPosition = door.poly.center.addScaledVector(door.normal, 20 * (roomSign || 0))
            const lightWalls = Poly.union(adjRoomNodes.map(x => holesWithDoors[x.holeIndex]))[0];
            // TODO cache door triangulation earlier
            const triangs = closedDoorPolys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
            return geom.lightPolygon(lightPosition, 1000, triangs, lightWalls);
          })
        });

        const allHolePolys = rootHoleIds
          .map(id => holesWithDoors[id]) // Each root contribs holeWithDoor
          .concat(lightPolygons) // Each open door contribs a light polygon
          .map(x => x.precision(3));

        const observableDoors = roomGraph.getAdjacentDoors(...rootHoleIds.map(id => roomGraph.nodesArray[id]));
        this.doorsApi.setObservableDoors(observableDoors.map(x => x.doorIndex));
        const maskPoly = Poly.cutOut(allHolePolys, [hullOutline],)
          .map(poly => poly.translate(-pngRect.x, -pngRect.y));
        const svgPaths = maskPoly.map(poly => `${poly.svgPath}`).join(' ');
        update();

        setTimeout(() => {// We delay mask update when closing doors
          state.clipPath = `path('${svgPaths}')`;
          update();
        }, delayMask);
      },
    };
  }, [gm]);

  React.useEffect(() => {
    if (gm) {
      // Ensure consistency on switch geomorphs
      for (const holeId of Object.keys(state.isHoleShown).map(Number)) {
        if (!gm.holes[holeId]) delete state.isHoleShown[holeId];
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
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
          }}
        />

        <img
          className="geomorph-dark"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
            clipPath: state.clipPath,
            WebkitClipPath: state.clipPath,
          }}
        />

        <div
          className="light-toggles"
          onClick={state.onToggleLight}
        >
          {gm.d.holeSwitches.map((center, holeIndex) => {
            return <div
              key={holeIndex}
              data-index={holeIndex}
              className="toggle"
              style={{
                left: center.x - 5,
                top: center.y - 5,
                borderColor: state.isHoleShown[holeIndex] ? '#5f5' : 'rgba(200, 0, 0, 0.3)',
                outline: state.isHoleShown[holeIndex] ? '1px solid black' : '1px solid rgba(255, 255, 255, 0.5)',
              }}
            />
          })}
        </div>

        <Doors
          gm={geomorphDataToGeomorphsItem(gm, [1, 0, 0, 1, 0, 0])}
          wire={state.wire}
          onLoad={api => state.doorsApi = api}
        />

        {/* <DebugGraph gm={gm} /> */}

      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
// const layoutKey = 'g-301--bridge';
// const layoutKey = 'g-101--multipurpose';
// const layoutKey = 'g-102--research-deck';
// const layoutKey = 'g-302--xboat-repair-bay';
const layoutKey = 'g-303--passenger-deck';

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
      width={gm.d.pngRect.width}
      height={gm.d.pngRect.height}
    >
      {gm.d.roomGraph.nodesArray.map((node, i) =>
        <circle
          key={i}
          stroke="rgba(200, 0, 0, 1)"
          fill="none"
          r={5}
          {...node.type === 'room'
            ? { cx: gm.d.holeSwitches[i].x, cy: gm.d.holeSwitches[i].y,  }
            : { cx: gm.doors[node.doorIndex].poly.center.x, cy: gm.doors[node.doorIndex].poly.center.y }
          }
        />
        )}
        {gm.holes.map((poly) =>
          <path
            fill="none"
            stroke="yellow"
            d={poly.svgPath}
          />
        )}
        {gm.d.roomGraph.edgesArray
          .filter((x) => x.src.type === 'room' && x.dst.type === 'door')
          .map((edge) =>
            <line
              stroke="red"
              x1={gm.d.holeSwitches[
                /** @type {Graph.RoomGraphNodeRoom} */ (edge.src).holeIndex].x}
              y1={gm.d.holeSwitches[
                /** @type {Graph.RoomGraphNodeRoom} */ (edge.src).holeIndex].y}
              x2={gm.doors[
                /** @type {Graph.RoomGraphNodeDoor} */ (edge.dst).doorIndex].poly.center.x}
              y2={gm.doors[
                /** @type {Graph.RoomGraphNodeDoor} */  (edge.dst).doorIndex].poly.center.y}
            />
        )}
    </svg>
  );
}