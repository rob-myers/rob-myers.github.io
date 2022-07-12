import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { visibleUnicodeLength } from "../service/generic";
import { Vect } from "../geom";
import { ansiColor } from "../sh/sh.util";
import useSessionStore from "../sh/session.store";

/** @param {Props} props */
export default function DebugWorld(props) {

  const { fovApi } = props.worldApi;
  const { gmId, roomId } = fovApi;
  if (typeof gmId !== 'number') {
    return null;
  }

  const gm = props.gms[gmId];
  const visDoorIds = props.worldApi.doorsApi.getVisible(gmId);
  const roomNavPoly = gm.lazy.roomNavPoly[roomId];
  const roomNavAabb = roomNavPoly.rect;
  const roomAabb = gm.rooms[roomId].rect;
  const roomPoly = gm.rooms[roomId];
  const roomLabel = gm.point[roomId].labels.find(x => x.tags.includes('room'));

  const onClick = React.useCallback(/** @param {React.MouseEvent<HTMLDivElement>} e */ async (e) => {
    const target = (/** @type {HTMLElement} */ (e.target));

    if (target.className === 'debug-door-arrow') {
      /**
       * Manual light control.
       */
      const door = gm.doors[Number(target.getAttribute('data-debug-door-id'))];
      const hullDoorId = gm.getHullDoorId(door);
      if (hullDoorId >= 0) {
        const ctxt = props.gmGraph.getAdjacentRoomCtxt(gmId, hullDoorId);
        if (ctxt) fovApi.setRoom(ctxt.adjGmId, ctxt.adjRoomId);
        else console.info('hull door is isolated', gmId, hullDoorId);
      } else {
        return fovApi.setRoom(gmId, gm.getOtherRoomId(door, roomId));
      }
    }

    if (target.className === 'debug-label-info') {
      /**
       * Send our first rich message.
       */
      const label = gm.labels[Number(target.getAttribute('data-debug-label-id'))];

      const numDoors = gm.roomGraph.getAdjacentDoors(roomId).length;
      const line = `ℹ️  [${ansiColor.Blue}${label.text}${ansiColor.Reset
        }] with ${numDoors} door${numDoors > 1 ? 's' : ''}`;
        
      const sessionCtxts = Object.values(props.worldApi.npcsApi.session).filter(x => x.receiveMsgs);
      for (const { key: sessionKey } of sessionCtxts) {
        const globalLineNumber = await useSessionStore.api.writeMsgCleanly(sessionKey, line);
        props.worldApi.npcsApi.addTtyLineCtxts(sessionKey, globalLineNumber, [{
          lineNumber: globalLineNumber,
          lineText: line, 
          linkText: label.text,
          linkStartIndex: visibleUnicodeLength('ℹ️  ['),
          key: 'room', gmId, roomId,
        }]);
      }
    }

  }, [gm, props, gmId, roomId]);

  return (
    <div
      className={classNames("debug-parent", rootCss)}
      onClick={onClick}
    >
      {props.outlines && props.gms.map((gm, gmId) =>
        <div
          key={gmId}
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
        /** Must transform local ordinates */
        style={{ transform: gm.transformStyle }}
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
              {visDoorIds.map(doorId => {
                const { seg: [src, dst] } = gm.doors[doorId];
                return <line key={doorId} stroke="red" x1={src.x} y1={src.y} x2={dst.x} y2={dst.y} />
              })}
            </g>
          </svg>
        )}

        {props.roomOutlines && (
          <svg
            className="debug-room-outline"
            width={roomAabb.width}
            height={roomAabb.height}
            style={{
              left: roomAabb.x,
              top: roomAabb.y,
            }}
          >
            <g style={{ transform: `translate(${-roomAabb.x}px, ${-roomAabb.y}px)` }}>
              <path className="room-outline" d={roomPoly.svgPath} />
            </g>
          </svg>
        )}

        {visDoorIds.map(doorId => {
          const { poly, normal, roomIds } = gm.doors[doorId];
          const sign = roomIds[0] === roomId ? 1 : -1;
          const angle = Vect.from(normal).scale(-sign).angle;
          const arrowPos = poly.center.addScaledVector(normal, sign * debugDoorOffset);
          const idIconPos = poly.center.addScaledVector(normal, -sign * debugDoorOffset);
          return [
            <div
              key={doorId}
              data-debug-door-id={doorId}
              data-tags="debug door-arrow"
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
            ,
            props.showIds && (
              <div
                key={"icon" + doorId}
                className="debug-door-id-icon"
                style={{ left: idIconPos.x, top: idIconPos.y - 4 }}
              >
                {doorId}
              </div>
            )
          ];
        })}

        {props.showIds && (
          <div
            className="debug-room-id-icon"
            style={{ left: roomNavAabb.x + roomNavAabb.width - 35, top: roomNavAabb.y + 25 }}
          >
            {roomId}
          </div>
        )}

        {props.showLabels && roomLabel && (
          <div
            key={roomLabel.index}
            data-debug-label-id={roomLabel.index}
            data-tags="debug label-icon"
            className="debug-label-info"
            title={roomLabel.text}
            style={{
              left: roomLabel.center.x - debugRadius,
              top: roomLabel.center.y - debugRadius,
              width: debugRadius * 2,
              height: debugRadius * 2,
              filter: 'invert(100%)',
            }}
          />
        )}

        {props.windows && gm.windows.map(({ baseRect, angle }, i) => {
          return (
            <div
              key={`window-${i}`}
              className="debug-window"
              style={{
                left: baseRect.x,
                top: baseRect.y,
                width: baseRect.width,
                height: baseRect.height,
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
 * @typedef Props @type {object}
 * @property {Geomorph.GeomorphDataInstance[]} gms
 * @property {Graph.GmGraph} gmGraph
 * @property {boolean} [localNav]
 * @property {boolean} [outlines]
 * @property {boolean} [roomOutlines]
 * @property {boolean} [showIds]
 * @property {boolean} [showLabels]
 * @property {boolean} [windows]
 * @property {import('../example/NavDemo1').State} worldApi
 */

const debugRadius = 5;
const debugDoorOffset = 10;

const rootCss = css`
  div.debug {
    position: absolute;

    div.debug-door-arrow, div.debug-label-info {
      cursor: pointer;
      position: absolute;
      border-radius: ${debugRadius}px;
    }
    div.debug-door-arrow {
      background-image: url('/icon/solid_arrow-circle-right.svg');
    }
    div.debug-label-info {
      background-image: url('/icon/info-icon.svg');
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
    svg.debug-room-nav, svg.debug-room-outline {
      position: absolute;
      pointer-events: none;
      path.nav-poly {
        pointer-events: none;
        fill: rgba(255, 0, 0, 0.1);
        stroke: blue;
      }
      path.room-outline {
        pointer-events: none;
        fill: rgba(0, 0, 255, 0.1);
        stroke: red;
      }
    }
  }  
`;
