import React from "react";
import { css } from "goober";
import classNames from "classnames";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "projects/hooks/use-update";

/**
 * Doors for a specific geomorph.
 * @param {NPC.DoorsProps} props
 */
export default function Doors(props) {
  const { gm } = props;
  const update = useUpdate();

  const state = useMuState(() => {
    /** @type {NPC.DoorsApi} */
    const api = {
      getOpen() { return {...state.open}; },
      /** @param {number[]} observableIds */
      setObservableDoors(observableIds) {
        state.observable = observableIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
        update();
      },
    };    

    return {
      api,
      open: /** @type {{ [doorIndex: number]: true }} */ ({}),
      observable: /** @type {{ [doorIndex: number]: true }} */ ({}),
      /** @param {React.MouseEvent} e */
      onClick(e) {
        const div = /** @type {HTMLDivElement} */ (e.target);
        const index = Number(div.getAttribute('data-index'));
        if (!state.observable[index]) return;
        state.open[index] ? delete state.open[index] : state.open[index] = true;
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
      {gm.doors.map(({ rect, angle, tags }, i) =>
        <div
          key={i}
          data-index={i}
          className={classNames("door", {
            open: state.open[i],
            iris: tags.includes('iris'),
            observable: state.observable[i],
          })}
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

    &:not(.observable) {
      background: #444;
      border: 1px solid #00204b;
    }

    &.observable:not(.iris) {
      cursor: pointer;
      background: #fff;
      border: 1px solid #555;

      transition: width 300ms ease-in;
      &.open {
        width: 10px !important;
      }
    }

    &.observable.iris {
      cursor: pointer;
      background-image: linear-gradient(45deg, #888 33.33%, #333 33.33%, #333 50%, #888 50%, #888 83.33%, #333 83.33%, #333 100%);
      background-size: 4.24px 4.24px;
      border: 1px solid #fff;
      
      opacity: 1;
      transition: opacity 300ms ease;
      &.open {
        opacity: 0.1;
      }
    }
  }
`;
