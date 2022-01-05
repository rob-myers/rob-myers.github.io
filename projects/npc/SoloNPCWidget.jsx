import React from "react";
import { css } from "goober";
import DraggablePath from "../ui/DraggablePath";

// TODO sometimes path doesn't update

/** @param {Props} props */
export default function SoloNPCWidget(props) {

  const [state] = React.useState(() => {
    /** @type {{ bot: SVGGElement; api: NPC.SoloApi }} */
    const output = {
      bot: /** @type {SVGGElement} */ ({}),
      api: {
        key: 'solo',
        anim: /** @type {Animation} */ ({}),
        initPaused: false,
        getPosition: () => {
          // https://stackoverflow.com/a/4976554/2917822
          const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.bot).transform);
          return { x: matrix.m41, y: matrix.m42 };
        },
        isEnabled: () => state.api.anim.playState !== 'paused',
      },
    };
    props.onLoad(output.api);
    return output;
  });

  return (
    <g className={rootCss}>
      <DraggablePath
        initSrc={props.initSrc}
        initDst={props.initDst}
        zoneKey={props.zoneKey}
        npcApi={state.api}
        radius={4}
        onChange={(path) => {
          const { bot, api } = state;
          if (!bot || !path.length) {
            return;
          }

          const npcPos = state.api.getPosition();
          const npcPathIndex = path.findIndex(p => p.equals(npcPos));
          const rPath = npcPathIndex !== -1 ? path.slice(npcPathIndex) : path;
          if (rPath.length === 1) {
            return; // Do not move
          }

          // Move bot along path using Web Animations API
          const edges = rPath.map((p, i) => ({ p, q: rPath[i + 1] })).slice(0, -1);
          const elens = edges.map(({ p, q }) => p.distanceTo(q));
          const { sofars, total } = elens.reduce((agg, length) => {
            agg.total += length;
            agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
            return agg;
          }, { sofars: [0], total: 0 });

          api.anim.cancel?.();
          // TODO 1 frame animations breaks polyfill
          api.anim = bot.animate(
            rPath.map((p, i) => ({ offset: total ? sofars[i] / total : 0, transform: `translate(${p.x}px, ${p.y}px)` })),
            { duration: total * 15, direction: 'normal', fill: 'forwards' },
            // { duration: total * 10, direction: 'normal', fill: 'forwards' },
          );

          if (api.initPaused) {
            api.anim.pause();
          }
        }}
      />
    
      <g
        className="bot"
        ref={(el) => {
          if (el && (state.bot !== el)) {
            state.bot = el;
            state.bot.animate([
              { transform: `translate(0px, 0px)` },
              { transform: `translate(${props.initSrc.x}px, ${props.initSrc.y}px)` },
            ], { fill: 'forwards' });
          }
        }}
      >
        <circle
          onClick={() => {
            /**
             * TODO pause onclick (not drag) either draggable node instead
             */
            const { anim } = state.api;
            if (anim.playState === 'paused') anim.play();
            else if (anim.playState === 'running') anim.pause();
          }}
          fill="red" stroke="black" strokeWidth={2} r={10}
        />
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
    /* pointer-events: none; */
  }
`;

