import React from "react";
import { css } from "goober";
import classNames from "classnames";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import DraggablePath from "../ui/DraggablePath";
import { useGeomorphJson, usePathfinding } from "../hooks";

// TODO
// - extract bot into SoloNPCWidget
// - develop SoloNPCWidget
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  const layoutKey = /** @type {Geomorph.LayoutKey} */ ('g-301--bridge');
  const [state] = React.useState(() => ({
    pathA: { initSrc: new Vect(300, 300), initDst: new Vect(600, 300) },
    pathB: { initSrc: new Vect(200, 200), initDst: new Vect(680, 200) },
    botA: {
      el: /** @type {SVGGElement} */ ({}),
      anim: /** @type {Animation} */ ({}),
    },
    disabled: props.disabled,
  }));

  const { data: gm } = useGeomorphJson(layoutKey);
  const { data: pf } = usePathfinding(layoutKey, gm?.navDecomp);

  React.useEffect(() => {
    if (props.disabled) {
      state.botA.anim.pause?.();
    } else {
      state.botA.anim.play?.();
    }
    state.disabled = props.disabled;
  }, [props.disabled]);

  return (
    <PanZoom gridBounds={defaults.gridBounds} initViewBox={initViewBox} maxZoom={6}>
      <g
        className={classNames(rootCss, !props.disabled && animateNavpathCss)}
        ref={(rootEl) => {
          if (rootEl) {
            state.botA.el = /** @type {*} */ (rootEl.querySelector('g.bot-a'));
          }
        }}
      >

        {gm && pf && <>
          <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />

          {pf.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
            <polygon className="navtri" points={`${vertexIds.map(id => pf.zone.vertices[id])}`} />
          ))}

          <DraggablePath
            initial={{ src: state.pathA.initSrc, dst: state.pathA.initDst }}
            zoneKey={layoutKey}
            radius={4}
            onChange={(path) => {
              const bot = state.botA;

              if (bot.el && path.length) {
                // Move bot along path using Web Animations API
                const edges = path.map((p, i) => ({ p, q: path[i + 1] })).slice(0, -1);
                const elens = edges.map(({ p, q }) => p.distanceTo(q));
                const { sofars, total } = elens.reduce((agg, length) => {
                  agg.total += length;
                  agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
                  return agg;
                }, { sofars: [0], total: 0 });

                bot.anim = bot.el.animate(
                  path.map((p, i) => ({ offset: sofars[i] / total, transform: `translate(${p.x}px, ${p.y}px)` })),
                  { duration: 5000, iterations: Infinity, direction: 'alternate',  },
                );

                if (state.disabled) bot.anim.pause();
              }
            }}
            />

          <g className="bot-a">
            <circle fill="red" stroke="black" strokeWidth={2} r="10" />
            <line stroke="black" strokeWidth={2} x2="10" />
          </g>

        </>}
        
      </g>

    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  polyline.navpath {
    fill: none;
    stroke: #777;
    stroke-width: 2;
    stroke-dasharray: 8px;
    stroke-dashoffset: 16px;
  }

  @keyframes flash {
    0% { stroke-dashoffset: 16px; }
    100% { stroke-dashoffset: 0px; }
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      stroke: #900;
    }
  }

  g.bot-a {
    pointer-events: none;
  }
`;

const animateNavpathCss = css`
  polyline.navpath {
    animation: 600ms flash infinite linear;
  }
`;

const initViewBox = new Rect(200, 0, 600, 600);
