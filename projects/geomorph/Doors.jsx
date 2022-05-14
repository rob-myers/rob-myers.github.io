import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { assertNonNull } from "../service/generic";
import { strokePolygon } from "../service/dom";
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
    const api = {
      get ready() {
        return true;
      },
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
    };

    return {
      /** @type {HTMLCanvasElement[]} */
      canvas: [],
      /** @type {{ [doorIndex: number]: true }[]} */
      open: props.gms.map((_, gmId) => (props.initOpen[gmId] || [])
        .reduce((agg, doorId) => ({ ...agg, [doorId]: true }), {})),
      /** @type {{ [doorIndex: number]: true }[]} */
      vis: props.gms.map(_ => ({})),

      rootEl: /** @type {HTMLDivElement} */ ({}),

      /** @param {PointerEvent} e */
      onToggleDoor(e) {
        const gmIndexAttr = /** @type {HTMLDivElement} */ (e.target).getAttribute('data-gm-id');
        const gmId = Number(gmIndexAttr);
        const doorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-door-id'));
        const hullDoorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-hull-door-id'));
        const gmDoorNode = hullDoorId === -1 ? null : props.gmGraph.getDoorNodeByIds(gmId, hullDoorId);

        if (gmIndexAttr === null || !state.vis[gmId][doorId] || gmDoorNode?.sealed) {
          return;
        }

        const adjHull = hullDoorId !== -1
          ? props.gmGraph.getAdjacentRoomCtxt(gmId, hullDoorId) : null;

        if (state.open[gmId][doorId]) {
          delete state.open[gmId][doorId]
          adjHull && (delete state.open[adjHull.adjGmId][adjHull.adjDoorId]);
        } else {
          state.open[gmId][doorId] = true;
          adjHull && (state.open[adjHull.adjGmId][adjHull.adjDoorId] = true);
        }
        const key = state.open[gmId][doorId] ? 'opened-door' : 'closed-door';
        props.wire.next({ gmIndex: gmId, index: doorId, key });
        adjHull && props.wire.next({ gmIndex: adjHull.adjGmId, index: adjHull.adjDoorId, key });

        state.drawInvisibleInCanvas(gmId);
      },
      /** @param {number} gmId */
      drawInvisibleInCanvas(gmId) {
        const canvas = state.canvas[gmId];
        const ctxt = assertNonNull(canvas.getContext('2d'));
        const gm = props.gms[gmId];

        ctxt.setTransform(1, 0, 0, 1, -gm.pngRect.x, -gm.pngRect.y);
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.strokeStyle = '#ffd';
        ctxt.fillStyle = '#f00';
        ctxt.lineWidth = 0.5;
        gmId === 0 && console.log(state.vis[gmId])
        gm.doors.forEach(({ poly }, i) => {
          if (!state.vis[gmId][i]) {
            strokePolygon(ctxt, [poly]);
            ctxt.fill()
          }
        });
      },

      ...api, // Keep things shallow for HMR
    };
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
                  left: door.rect.x,
                  top: door.rect.y,
                  width: door.rect.width,
                  height: door.rect.height,
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
      border: 1px solid #555;

      transition: width 300ms ease-in;
      &.open {
        width: 10px !important;
      }
    }

    &.iris {
      background-image: linear-gradient(45deg, #888 33.33%, #333 33.33%, #333 50%, #888 50%, #888 83.33%, #333 83.33%, #333 100%);
      background-size: 4.24px 4.24px;
      border: 1px solid #fff;
      
      opacity: 1;
      transition: opacity 300ms ease;
      &.open {
        opacity: 0.2;
      }
    }
  }
`;
