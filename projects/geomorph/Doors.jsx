import React from "react";
import { css } from "goober";
import classNames from "classnames";
import { assertNonNull } from "../service/generic";
import { fillPolygon } from "../service/dom";
import useMuState from "../hooks/use-mu-state";
import useUpdate from "../hooks/use-update";

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
      getOpen() {
        return Object.keys(state.open).map(Number);
      },
      /** @param {number[]} observableIds */
      setObservableDoors(observableIds) {
        state.observable = observableIds.reduce((agg, id) => ({ ...agg, [id]: true }), {});
        state.renderUnobservables();
        update();
      },
    };

    return {
      api,
      canvas: /** @type {HTMLCanvasElement} */ ({}),
      open: /** @type {{ [doorIndex: number]: true }} */ ({}),
      observable: /** @type {{ [doorIndex: number]: true }} */ ({}),
      rootEl: /** @type {HTMLDivElement} */ ({}),
      /** @param {PointerEvent} e */
      onToggleDoor(e) {
        const index = Number(/** @type {HTMLDivElement} */ (e.target).getAttribute('data-index'));
        if (!state.observable[index]) return;
        state.open[index] ? delete state.open[index] : state.open[index] = true;
        props.wire.next({ key: state.open[index] ? 'opened-door' : 'closed-door', index });
        state.renderUnobservables();
      },
      renderUnobservables() {
        const ctxt = assertNonNull(state.canvas.getContext('2d'));
        ctxt.clearRect(0, 0, state.canvas.width, state.canvas.height);
        ctxt.fillStyle = '#555';
        ctxt.strokeStyle = '#00204b';
        gm.gm.doors.filter((_, i) => !state.observable[i])
          .forEach(({ poly }) => { fillPolygon(ctxt, [poly]); ctxt.stroke(); });
      },
    };
  });

  React.useLayoutEffect(() => {
    props.onLoad?.(state.api);
  }, []);
  React.useEffect(() => {
    state.renderUnobservables();
    state.rootEl.addEventListener('pointerup', state.onToggleDoor);
    return () => {
      state.rootEl.removeEventListener('pointerup', state.onToggleDoor);
    };
  }, []);

  return (
    <div
      className={classNames("doors", rootCss)}
      ref={el => el && (state.rootEl = el)}
      style={{
        transform: gm.transformStyle,
        transformOrigin: `${gm.gm.d.pngRect.x}px ${gm.gm.d.pngRect.y}px`,
      }}
    >
      {
        // TODO since we use untransformed doors,
        // maybe don't precompute transformed ones
      }
      {gm.gm.doors.map(({ rect, angle, tags }, i) =>
        state.observable[i] && (
          <div
            key={i}
            data-index={i}
            className={classNames("door", {
              open: state.open[i],
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
        )
      }
      <canvas
        ref={(el) => el && (state.canvas = el)}
        width={gm.pngRect.width}
        height={gm.pngRect.height}
      />
    </div>
  );
}

const rootCss = css`
  canvas {
    position: absolute;
    pointer-events: none;
  }

  div.door {
    position: absolute;

    &:not(.iris) {
      cursor: pointer;
      background: #fff;
      border: 1px solid #555;

      transition: width 300ms ease-in;
      &.open {
        width: 10px !important;
      }
    }

    &.iris {
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
