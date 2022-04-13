import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { assertNonNull } from "../service/generic";
import { fillPolygon } from "../service/dom";
import useStateRef from "../hooks/use-mu-state";
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
      getVisible(gmIndex) {
        return Object.keys(state.vis[gmIndex]).map(Number);
      },
      getOpen(gmIndex) {
        return Object.keys(state.open[gmIndex]).map(Number);
      },
      setVisible(gmIndex, doorIds) {
        state.vis[gmIndex] = doorIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
        state.drawInvisibleInCanvas(gmIndex);
        update();
      },
    };

    return {
      api,
      /** @type {HTMLCanvasElement[]} */
      canvas: [],
      /** @type {{ [doorIndex: number]: true }[]} */
      open: props.gms.map(_ => ({})),
      /** @type {{ [doorIndex: number]: true }[]} */
      vis: props.gms.map(_ => ({})),

      rootEl: /** @type {HTMLDivElement} */ ({}),

      /** @param {PointerEvent} e */
      onToggleDoor(e) {
        const gmIndex = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-gm-index'));
        const doorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-door-index'));
        const hullDoorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-hull-door-index'));

        if (!state.vis[gmIndex][doorId]) {
          return;
        }

        const adjHull = hullDoorId !== -1
          ? props.gmGraph.getAdjacentHoleCtxt(gmIndex, hullDoorId) : null;

        if (state.open[gmIndex][doorId]) {
          delete state.open[gmIndex][doorId]
          adjHull && (delete state.open[adjHull.adjGmId][adjHull.adjDoorId]);
        } else {
          state.open[gmIndex][doorId] = true;
          adjHull && (state.open[adjHull.adjGmId][adjHull.adjDoorId] = true);
        }
        const key = state.open[gmIndex][doorId] ? 'opened-door' : 'closed-door';
        props.wire.next({ gmIndex, index: doorId, key });
        adjHull && props.wire.next({ gmIndex: adjHull.adjGmId, index: adjHull.adjDoorId, key });

        state.drawInvisibleInCanvas(gmIndex);
      },
      /** @param {number} gmIndex */
      drawInvisibleInCanvas(gmIndex) {
        const canvas = state.canvas[gmIndex];
        const ctxt = assertNonNull(canvas.getContext('2d'));
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.fillStyle = '#555';
        ctxt.strokeStyle = '#00204b';
        const gm = props.gms[gmIndex];
        gm.doors.forEach(({ poly }, i) => {
          if (!state.vis[gmIndex][i]) {
            fillPolygon(ctxt, [poly]);
            ctxt.stroke();
          }
        });
      },
    };
  }, [props.gms]);

  // Must useLayoutEffect because NavDemo1 onChangeDeps runs early (?)
  React.useLayoutEffect(() => {
    props.onLoad(state.api);
    props.gms.forEach((_, gmIndex) => {// For HMR?
      state.open[gmIndex] = state.open[gmIndex] || {};
      state.vis[gmIndex] = state.vis[gmIndex] || {};
    });
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
      {props.gms.map((gm, gmIndex) => (
        <div
          key={gm.itemKey}
          style={{
            transform: gm.transformStyle,
          }}
        >
          {gm.doors.map((door, i) =>
            state.vis[gmIndex][i] &&
              <div
                key={i}
                className={classNames("door", {
                  open: state.open[gmIndex][i],
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
                  data-gm-index={gmIndex}
                  data-door-index={i}
                  data-hull-door-index={gm.hullDoors.indexOf(door)}
                  style={{
                    position: 'absolute',
                    left: `calc(50% - ${doorTouchRadius * 2}px)`,
                    top: `calc(50% - ${doorTouchRadius}px)`,
                    width: doorTouchRadius * 4,
                    height: 20,
                    background: 'rgba(100, 0, 0, 0.05)',
                    borderRadius: doorTouchRadius,
                  }}
                />
              </div>
            )
          }
          <canvas
            ref={(el) => el && (state.canvas[gmIndex] = el)}
            width={gm.pngRect.width}
            height={gm.pngRect.height}
          />
        </div>
      ))}
    </div>
  );
}

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

const doorTouchRadius = 10;
