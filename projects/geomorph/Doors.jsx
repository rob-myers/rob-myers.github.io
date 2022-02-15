import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import useMuState from "../hooks/use-mu-state";

/**
 * Doors for a specific geomorph.
 * @param {NPC.DoorsProps} props
 */
export default function Doors(props) {
  const { json } = props;

  const state = useMuState(() => {
    const api = {
      evt: /** @type {Subject<NPC.DoorMessage>} */ (new Subject),
    };

    return {
      api,
      /** @param {React.MouseEvent} e */
      onClick(e) {
        const div = /** @type {HTMLDivElement} */ (e.target);
        const nowOpen = div.classList.toggle('open');
        props.wire.next({
          key: nowOpen ? 'opened-door' : 'closed-door',
          index: Number(div.getAttribute('data-index')),
        });
      },
    };
  });

  return (
    <foreignObject
      {...json.pngRect}
      xmlns="http://www.w3.org/1999/xhtml"
      className={rootCss}
    >
      <div onPointerUp={state.onClick}>
        {json.doors.map(({ rect, angle }, i) =>
          <div
            className="door"
            data-index={i}
            style={{
              left: rect.x - json.pngRect.x,
              top: rect.y - json.pngRect.y,
              width: rect.width,
              height: rect.height,
              transformOrigin: 'top left',
              transform: `rotate(${angle}rad)`,
            }}
          />
        )}
      </div>
    </foreignObject>
  );
}

const rootCss = css`
  div.door {
    cursor: pointer;
    position: absolute;
    background: #000; /** ? */
    border: 1px solid black;
    opacity: 1;
    transition: opacity 100ms linear;
    &.open {
      opacity: 0;
    }
  }
`;
