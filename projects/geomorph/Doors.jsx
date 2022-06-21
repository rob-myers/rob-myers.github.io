import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { Subject } from "rxjs";
import { assertNonNull } from "../service/generic";
import { strokePolygon } from "../service/dom";
import { getCached } from "../service/query-client";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";

/**
 * Doors for `Geomorph.UseGeomorphItems`.
 * @param {NPC.DoorsProps} props
 */
export default function Doors(props) {
  const update = useUpdate();

  const state = useStateRef(() => {
    /** @type {NPC.DoorsApi} */
    const output = {
      events: new Subject,
      ready: true,
      getClosed(gmIndex) {
        const open = state.open[gmIndex];
        return props.gms[gmIndex].doors.map((_, i) => i).filter(i => !open[i]);
      },
      getOpen(gmIndex) {
        return Object.keys(state.open[gmIndex]).map(Number);
      },
      getVisible(gmIndex) {
        return Object.keys(state.vis[gmIndex]).map(Number);
      },
      setVisible(gmId, doorIds) {
        state.vis[gmId] = doorIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
        state.drawInvisibleInCanvas(gmId);
        update();
      },

      canvas: [],
      open: props.gms.map((_, gmId) => (props.initOpen[gmId] || [])
        .reduce((agg, doorId) => ({ ...agg, [doorId]: true }), {})),
      vis: props.gms.map(_ => ({})),
  
      rootEl: /** @type {HTMLDivElement} */ ({}),
  
      onToggleDoor(e) {
        const gmIdAttr = /** @type {HTMLDivElement} */ (e.target).getAttribute('data-gm-id');
        const gmId = Number(gmIdAttr);
        const doorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-door-id'));
        const hullDoorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-hull-door-id'));
        const gmDoorNode = hullDoorId === -1 ? null : props.gmGraph.getDoorNodeByIds(gmId, hullDoorId);
  
        if (gmIdAttr === null || !state.vis[gmId][doorId] || gmDoorNode?.sealed) {
          return; // Not a door, not visible, or sealed permanently
        }

        // Cannot close door when some npc nearby
        // TODO provide props.haveCloseNpcs(gmId, doorId)
        if (state.open[gmId][doorId]) {
          const door = props.gms[gmId].doors[doorId];
          const convexPoly = door.poly.clone().applyMatrix(props.gms[gmId].matrix);
          const closeNpcs = /** @type {NPC.FullApi} */ (getCached(props.npcsKey)).getNpcsIntersecting(convexPoly);
          if (closeNpcs.length) {
            return;
          }
        }
  
        // Hull doors have an adjacent door which must also be toggled
        const adjHull = hullDoorId !== -1 ? props.gmGraph.getAdjacentRoomCtxt(gmId, hullDoorId) : null;
  
        if (state.open[gmId][doorId]) {
          delete state.open[gmId][doorId]
          adjHull && (delete state.open[adjHull.adjGmId][adjHull.adjDoorId]);
        } else {
          state.open[gmId][doorId] = true;
          adjHull && (state.open[adjHull.adjGmId][adjHull.adjDoorId] = true);
        }
        const key = state.open[gmId][doorId] ? 'opened-door' : 'closed-door';
        state.events.next({ key, gmIndex: gmId, index: doorId });
        adjHull && state.events.next({ key, gmIndex: adjHull.adjGmId, index: adjHull.adjDoorId });
  
        state.drawInvisibleInCanvas(gmId);
      },
      /** @param {number} gmId */
      drawInvisibleInCanvas(gmId) {
        const canvas = state.canvas[gmId];
        const ctxt = assertNonNull(canvas.getContext('2d'));
        const gm = props.gms[gmId];
  
        ctxt.setTransform(1, 0, 0, 1, 0, 0);
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.setTransform(1, 0, 0, 1, -gm.pngRect.x, -gm.pngRect.y);
        ctxt.strokeStyle = '#ffd';
        ctxt.fillStyle = '#aaaaaa44';
        ctxt.lineWidth = 0.5;
  
        gm.doors.forEach(({ poly }, i) => {
          if (!state.vis[gmId][i]) {
            strokePolygon(ctxt, [poly]);
            ctxt.fill()
          }
        });
      },
    };

    return output;
  });

  React.useEffect(() => {
    props.onLoad(state);
  }, []);

  React.useEffect(() => {
    props.gms.forEach((_, gmIndex) => state.drawInvisibleInCanvas(gmIndex));
    state.rootEl.addEventListener('pointerup', state.onToggleDoor);
    return () => void state.rootEl.removeEventListener('pointerup', state.onToggleDoor);
  }, [props.gms]);
  
  return (
    <div
      ref={el => el && (state.rootEl = el)}
      className={classNames("doors", rootCss)}
    >
      {props.gms.map((gm, gmId) => (
        <div
          key={gm.itemKey}
          style={{
            transform: gm.transformStyle,
          }}
        >
          {gm.doors.map((door, i) =>
            state.vis[gmId][i] &&
              <div
                key={i}
                className={classNames("door", {
                  open: state.open[gmId][i],
                  iris: door.tags.includes('iris'),
                })}
                style={{
                  left: door.baseRect.x,
                  top: door.baseRect.y,
                  width: door.baseRect.width,
                  height: door.baseRect.height,
                  transform: `rotate(${door.angle}rad)`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  className="door-touch-ui"
                  data-gm-id={gmId}
                  data-door-id={i}
                  data-hull-door-id={gm.hullDoors.indexOf(door)}
                />
              </div>
            )
          }
          <canvas
            ref={(el) => el && (state.canvas[gmId] = el)}
            width={gm.pngRect.width}
            height={gm.pngRect.height}
            style={{ left: gm.pngRect.x, top: gm.pngRect.y }}
          />
        </div>
      ))}
    </div>
  );
}

const doorTouchRadius = 10;

const rootCss = css`
  position: absolute;

  canvas {
    position: absolute;
    pointer-events: none;
  }

  div.door {
    position: absolute;
    pointer-events: none;
    
    .door-touch-ui {
      cursor: pointer;
      pointer-events: all;
      position: absolute;
      left: calc(50% - ${doorTouchRadius * 2}px);
      top: calc(50% - ${doorTouchRadius}px);
      width: ${doorTouchRadius * 4}px;
      height: 20px;
      background: rgba(100, 0, 0, 0.1);
      border-radius: ${doorTouchRadius}px;
    }

    &:not(.iris) {
      background: #fff;

      transition: width 300ms ease-in;
      &.open {
        width: 4px !important;
      }
    }

    &.iris {
      background-image: linear-gradient(45deg, #fff 33.33%, #666 33.33%, #666 50%, #fff 50%, #fff 83.33%, #666 83.33%, #666 100%);
      background-size: 4.24px 4.24px;
      
      opacity: 1;
      transition: opacity 300ms ease;
      &.open {
        opacity: 0.2;
      }
    }
  }
`;
