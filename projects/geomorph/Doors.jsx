import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import useMuState from "../hooks/use-mu-state";

// NOTE tried <foreignObject> with divs, but Safari/IOS issue
// https://bugs.webkit.org/show_bug.cgi?id=23113

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
        const rect = /** @type {SVGRectElement} */ (e.target);
        const nowOpen = rect.classList.toggle('open');
        props.wire.next({
          key: nowOpen ? 'opened-door' : 'closed-door',
          index: Number(rect.getAttribute('data-index')),
        });
      },
    };
  });

  return (
    <g
      className={rootCss}
      onPointerUp={state.onClick}
    >
      {json.doors.map(({ rect, angle }, i) =>
        <rect
          key={i}
          data-index={i}
          className="door"
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          style={{
            transform: `rotate(${angle}rad)`,
            transformOrigin: `${rect.x}px ${rect.y}px`,
          }}
        />
      )}
    </g>
  );
}

const rootCss = css`
  rect.door {
    cursor: pointer;
    fill: #000;
    stroke: black;
    opacity: 1;
    transition: opacity 100ms linear;
    &.open {
      opacity: 0;
    }
  }
`;
