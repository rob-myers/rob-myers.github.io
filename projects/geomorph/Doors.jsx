import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { Subject } from "rxjs";
import { assertNonNull } from "../service/generic";
import { fillPolygon } from "../service/dom";
import { cssName, doorWidth, hullDoorWidth } from "../service/const";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";

/**
 * Doors for `Geomorph.UseGeomorphItems`.
 * @param {NPC.DoorsProps} props
 */
export default function Doors(props) {
  const update = useUpdate();

  const state = useStateRef(/** @type {() => NPC.DoorsApi} */ () => ({
    canvas: [],
    events: new Subject,
    open: props.gms.map((gm, gmId) =>
      gm.doors.map((_, doorId) => props.initOpen[gmId]?.includes(doorId) || false)
    ),
    ready: true,
    rootEl: /** @type {HTMLDivElement} */ ({}),
    vis: props.gms.map(_ => ({})),

    /** @param {number} gmId */
    drawInvisibleInCanvas(gmId) {
      const canvas = state.canvas[gmId];
      const ctxt = assertNonNull(canvas.getContext('2d'));
      const gm = props.gms[gmId];

      ctxt.setTransform(1, 0, 0, 1, 0, 0);
      ctxt.clearRect(0, 0, canvas.width, canvas.height);
      ctxt.setTransform(1, 0, 0, 1, -gm.pngRect.x, -gm.pngRect.y);
      ctxt.fillStyle = '#555';

      // Handle extension of open visible doors (orig via `relate-connectors` tag)
      const relDoorIds = gm.doors.flatMap((_, i) =>
        state.vis[gmId][i] && state.open[gmId][i] && gm.relDoorId[i]?.doorIds || []
      ).filter(doorId => state.open[gmId][doorId]);
      
      gm.doors.forEach(({ poly }, doorId) => {
        if (!state.vis[gmId][doorId] && !relDoorIds.includes(doorId)) {
          fillPolygon(ctxt, [poly]);
        }
      });
    },
    getClosed(gmId) {
      return state.open[gmId].flatMap((open, doorId) => open ? [] : doorId);
    },
    getOpen(gmId) {
      return state.open[gmId].flatMap((open, doorId) => open ? doorId : []);
    },
    getVisible(gmId) {
      return Object.keys(state.vis[gmId]).map(Number);
    },
    onToggleDoor(e) {
      const gmIdAttr = /** @type {HTMLDivElement} */ (e.target).getAttribute('data-gm-id');
      const gmId = Number(gmIdAttr);
      const doorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-door-id'));
      const hullDoorId = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-hull-door-id'));

      const gmDoorNode = hullDoorId === -1 ? null : props.gmGraph.getDoorNodeByIds(gmId, hullDoorId);
      const sealed = gmDoorNode?.sealed || props.gms[gmId].doors[doorId].tags.includes('sealed');

      if (gmIdAttr === null || !state.vis[gmId][doorId] || sealed) {
        return; // Not a door, not visible, or sealed permanently
      }

      if (!props.playerNearDoor(gmId, doorId)) {
        return;
      }

      if (state.open[gmId][doorId] && !props.safeToCloseDoor(gmId, doorId)) {
        return; // Cannot close if npc nearby
      }

      state.open[gmId][doorId] = !state.open[gmId][doorId];
      const key = state.open[gmId][doorId] ? 'opened-door' : 'closed-door';
      state.events.next({ key, gmIndex: gmId, index: doorId });

      // Unsealed hull doors have adjacent door, which must also be toggled
      const adjHull = hullDoorId !== -1 ? props.gmGraph.getAdjacentRoomCtxt(gmId, hullDoorId) : null;
      if (adjHull) {
        state.open[adjHull.adjGmId][adjHull.adjDoorId] = state.open[gmId][doorId];
        state.events.next({ key, gmIndex: adjHull.adjGmId, index: adjHull.adjDoorId });
      }
    },
    setVisible(gmId, doorIds) {
      state.vis[gmId] = doorIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
      state.drawInvisibleInCanvas(gmId);
      update();
    },
  }));

  React.useEffect(() => {
    props.onLoad(state);
  }, []);

  React.useEffect(() => {
    props.gms.forEach((_, gmId) => state.drawInvisibleInCanvas(gmId));
    /** @param {PointerEvent} e */
    const cb = (e) => state.onToggleDoor(e);
    state.rootEl.addEventListener('pointerup', cb);
    return () => void state.rootEl.removeEventListener('pointerup', cb);
  }, [props.gms]);
  
  return (
    <div
      ref={el => el && (state.rootEl = el)}
      className={classNames(cssName.doors, rootCss)}
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
                className={classNames(cssName.door, {
                  [cssName.hull]: door.tags.includes('hull'),
                  [cssName.iris]: door.tags.includes('iris'),
                  [cssName.open]: state.open[gmId][i],
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
                  className={cssName.doorTouchUi}
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

const rootCss = css`
  --npc-door-touch-radius: 10px;

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

      width: calc(100% + 2 * var(--npc-door-touch-radius));
      min-width: calc( 2 * var(--npc-door-touch-radius) );
      top: calc(-1 * var(--npc-door-touch-radius) + ${ doorWidth / 2 }px ); /** 5px for hull */
      left: calc(-1 * var(--npc-door-touch-radius));
      height: calc(2 * var(--npc-door-touch-radius));

      background: rgba(100, 0, 0, 0.1);
      border-radius: var(--npc-door-touch-radius);
    }

    &.hull .door-touch-ui {
      top: calc(-1 * var(--npc-door-touch-radius) + ${ hullDoorWidth / 2 }px );
    }

    &:not(.iris) {
      background: #444;
      border: 1px solid #999;

      transition: width 300ms ease-in;
      &.open {
        width: 4px !important;
      }
    }

    &.iris {
      background-image: linear-gradient(45deg, #000 33.33%, #888 33.33%, #888 50%, #000 50%, #000 83.33%, #888 83.33%, #aaa 100%);
      background-size: 4.24px 4.24px;
      border: 1px solid #aaa;
      
      opacity: 1;
      transition: opacity 300ms ease;
      &.open {
        opacity: 0.2;
      }
    }
  }
`;
