import React from "react";
import { css } from "goober";
import { Subject } from "rxjs";
import classNames from "classnames";
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
      open: /** @type {Record<Number, boolean>} */ ({}),
      /** @param {React.MouseEvent} e */
      onClick(e) {
        const rect = /** @type {HTMLDivElement} */ (e.target);
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
    <div
      className={rootCss}
      onPointerUp={state.onClick}
    >
      {json.doors.map(({ rect, angle }, i) =>
        <div
          key={i}
          data-index={i}
          className={classNames("door", { open: state.open[i] })}
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            transform: `rotate(${angle}rad)`,
            transformOrigin: 'top left',
          }}
        />
      )}
    </div>
  );
}

const rootCss = css`
  div.door {
    position: absolute;
    cursor: pointer;
    background: white;
    opacity: 1;
    transition: opacity 100ms linear;
    &.open {
      opacity: 0.2;
    }
  }
`;
