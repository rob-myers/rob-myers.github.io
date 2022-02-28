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
  const { gm } = props;

  const state = useMuState(() => {
    const api = {
      evt: /** @type {Subject<NPC.DoorMessage>} */ (new Subject),
    };

    return {
      api,
      open: /** @type {Record<Number, boolean>} */ ({}),
      /** @param {React.MouseEvent} e */
      onClick(e) {
        const div = /** @type {HTMLDivElement} */ (e.target);
        const index = Number(div.getAttribute('data-index'));
        state.open[index] = !state.open[index];
        const nextWidth = state.open[index] ? 10 : gm.d.doors[index].rect.width; // Leq for borders
        div.style.width = `${nextWidth}px`;
        props.wire.next({ key: state.open[index] ? 'opened-door' : 'closed-door', index });
      },
    };
  });

  return (
    <div
      className={rootCss}
      onPointerUp={state.onClick}
    >
      {gm.d.doors.map(({ rect, angle }, i) =>
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
    background: #fff;
    border: 1px solid #4e4e4e;
    
    transition: width 100ms ease-in;
    &.open {
      width: 0;
    }

    /* opacity: 1;
    transition: opacity 100ms linear;
    &.open {
      opacity: 0.2;
    } */
  }
`;
