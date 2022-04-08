import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { assertNonNull } from "../service/generic";
import { fillPolygon } from "../service/dom";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "../hooks/use-update";

/**
 * Doors for `Geomorph.UseGeomorphItems`.
 * @param {NPC.DoorsProps} props
 */
export default function Doors(props) {
  const update = useUpdate();

  const state = useMuState(() => {
    /** @type {NPC.DoorsApi} */
    const api = {
      get ready() {
        return true;
      },
      getObservable(gmIndex) {
        return Object.keys(state.observable[gmIndex]).map(Number);
      },
      getOpen(gmIndex) {
        return Object.keys(state.open[gmIndex]).map(Number);
      },
      setObservableDoors(gmIndex, observableIds) {
        state.observable[gmIndex] = observableIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
        state.renderUnobservables(gmIndex);
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
      observable: props.gms.map(_ => ({})),
      rootEl: /** @type {HTMLDivElement} */ ({}),

      /** @param {PointerEvent} e */
      onToggleDoor(e) {
        const gmIndex = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-gm-index'));
        const index = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-index'));

        if (!state.observable[gmIndex][index]) {
          return;
        }

        if (state.open[gmIndex][index]) {
          delete state.open[gmIndex][index]
        } else {
          state.open[gmIndex][index] = true;
        }
        props.wire.next({
          gmIndex,
          index,
          key: state.open[gmIndex][index] ? 'opened-door' : 'closed-door',
        });
        state.renderUnobservables(gmIndex);
      },
      /** @param {number} gmIndex */
      renderUnobservables(gmIndex) {
        const canvas = state.canvas[gmIndex];
        const ctxt = assertNonNull(canvas.getContext('2d'));
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.fillStyle = '#555';
        ctxt.strokeStyle = '#00204b';
        const gm = props.gms[gmIndex];
        gm.doors.filter((_, i) => !state.observable[gmIndex][i])
          .forEach(({ poly }) => {
            fillPolygon(ctxt, [poly]);
            ctxt.stroke();
          });
      },
    };
  }, [props.gms]);

  // Must useLayoutEffect because NavDemo1 onChangeDeps runs early (?)
  React.useLayoutEffect(() => {
    props.onLoad(state.api);
  }, []);

  React.useEffect(() => {
    props.gms.forEach((_, gmIndex) => {
      state.open[gmIndex] = state.open[gmIndex] || {};
      state.observable[gmIndex] = state.observable[gmIndex] || {};
      // TODO could also interchange/clear state.open[i]'s based on previous
      props.gms.forEach((_, gmIndex) => state.renderUnobservables(gmIndex));
    });
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
          {gm.doors.map(({ rect, angle, tags }, i) =>
            state.observable[gmIndex][i] &&
              <div
                key={i}
                data-gm-index={gmIndex}
                data-index={i}
                className={classNames("door", {
                  open: state.open[gmIndex][i],
                  iris: tags.includes('iris'),
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
    cursor: pointer;

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
        opacity: 0.1;
      }
    }
  }
`;
