import React from "react";
import { css } from "goober";
import classNames from "classnames";
import useMuState from "../hooks/use-mu-state";

/**
 * Doors for a specific geomorph.
 * @param {NPC.DoorsProps} props
 */
export default function Doors(props) {
  const { gm } = props;

  const state = useMuState(() => {
    /**
     * TODO rethink
     */
    /** @type {NPC.DoorsApi} */
    const api = {
      getOpen() { return {...state.open}; },
    };    

    return {
      api,
      open: /** @type {{ [doorIndex: number]: true }} */ ({}),
      /** @param {React.MouseEvent} e */
      onClick(e) {
        const div = /** @type {HTMLDivElement} */ (e.target);
        const index = Number(div.getAttribute('data-index'));
        state.open[index] ? delete state.open[index] : state.open[index] = true;
        const nextWidth = state.open[index] ? 10 : gm.doors[index].rect.width; // Leq for borders
        div.style.width = `${nextWidth}px`;
        props.wire.next({ key: state.open[index] ? 'opened-door' : 'closed-door', index });
      },
    };
  });

  React.useLayoutEffect(() => props.onLoad?.(state.api), []);

  return (
    <div
      className={rootCss}
      onPointerUp={state.onClick}
    >
      {gm.doors.map(({ rect, angle }, i) =>
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
    border: 1px solid #888;
    
    transition: width 100ms ease-in;
    &.open {
      width: 0;
    }
  }
`;
