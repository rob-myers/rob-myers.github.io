import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import classNames from "classnames";
import useMuState from "../hooks/use-mu-state";

// NOTE tried <foreignObject> with divs, but Safari/IOS issue
// https://bugs.webkit.org/show_bug.cgi?id=23113

/**
 * Doors for a specific geomorph.
 * @param {NPC.DoorsProps} props
 */
export default function SvgDoors(props) {
  const { json } = props;

  const state = useMuState(() => {
    const api = {
      evt: /** @type {Subject<NPC.DoorMessage>} */ (new Subject),
    };

    return {
      api,
      open: /** @type {Record<Number, boolean>} */ ({}),
      /** @param {React.MouseEvent} e */
      onClick(e) {
        const rect = /** @type {SVGRectElement} */ (e.target);
        const index = Number(rect.getAttribute('data-index'));
        const nowOpen = rect.classList.toggle('open');
        state.open[index] = nowOpen;
        props.wire.next({
          key: nowOpen ? 'opened-door' : 'closed-door',
          index,
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
          className={classNames("door", { open: state.open[i] })}
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
    opacity: 1;
    transition: opacity 100ms linear;
    &.open {
      opacity: 0;
    }
  }
`;
