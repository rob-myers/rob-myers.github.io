import React from "react";
import { css } from "goober";
import DraggablePath from "../ui/DraggablePath";

/** @param {Props} props */
export default function SoloNPCWidget(props) {

  const [state] = React.useState(() => {
    const output = {
      bot: /** @type {SVGGElement} */ ({}),
      /** @type {NPC.SoloApi} */
      api: {
        anim: /** @type {Animation} */ ({}),
        enabled: props.enabled,
      },
    };
    props.onLoad(output.api);
    return output;
  });

  return (
    <g className={rootCss}>
      <DraggablePath
        initial={{ src: props.initSrc, dst: props.initDst }}
        zoneKey={props.zoneKey}
        radius={4}
        onChange={(path) => {
          const { bot, api } = state;
          if (!bot || !path.length) return;

          /**
           * TODO expect path src -> npc -> dst
           * TODO animate from current npc position
           */

          // Move bot along path using Web Animations API
          const edges = path.map((p, i) => ({ p, q: path[i + 1] })).slice(0, -1);
          const elens = edges.map(({ p, q }) => p.distanceTo(q));
          const { sofars, total } = elens.reduce((agg, length) => {
            agg.total += length;
            agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
            return agg;
          }, { sofars: [0], total: 0 });

          api.anim = bot.animate(
            path.map((p, i) => ({ offset: sofars[i] / total, transform: `translate(${p.x}px, ${p.y}px)` })),
            { duration: 5000, iterations: Infinity, direction: 'alternate' },
          );

          if (!api.enabled) api.anim.pause();
        }}
      />
    
      <g
        className="bot"
        ref={(el) => {
          if (el && (state.bot !== el)) {
            state.bot = el;
            state.bot.animate([
              { transform: `translate(${props.initSrc.x}px, ${props.initSrc.y}px)` },
            ], { fill: 'forwards' });
          }
        }}
      >
        <circle fill="red" stroke="black" strokeWidth={2} r={10} />
        <line stroke="black" strokeWidth={2} x2={10} />
      </g>
    </g>
  );
}

/**
 * @typedef Props @type {object}
 * @property {(api: NPC.SoloApi) => void} onLoad
 * @property {boolean} enabled
 * @property {string} zoneKey
 * @property {Geom.VectJson} initSrc
 * @property {Geom.VectJson} initDst
 */

const rootCss = css`
  polyline.navpath {
    fill: none;
    stroke: #777;
    stroke-width: 2;
    stroke-dasharray: 8px;
    stroke-dashoffset: 16px;
  }

  g.bot {
    pointer-events: none;
  }
`;

