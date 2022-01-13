import React from "react";
import { css } from "goober";
import { Vect } from "../geom/vect";
import DraggablePath from "../ui/DraggablePath";

// TODO
// - isolate bug with backwards onclick

/** @param {Props} props */
export default function SoloNPCWidget(props) {

  const [state] = React.useState(() => {
    /** @type {{ bot: SVGGElement; api: NPC.SoloApi }} */
    const output = {
      bot: /** @type {SVGGElement} */ ({}),
      api: {
        key: 'solo',
        anim: /** @type {Animation} */ ({}),
        path: [],
        initPaused: false,
        data: { count: 0, edges: [], elens: [], sofars: [], total: 0 },
        getPath: () => state.api.path.slice(),
        getPosition: () => {
          // https://stackoverflow.com/a/4976554/2917822
          const matrix = new DOMMatrixReadOnly(window.getComputedStyle(state.bot).transform);
          return new Vect(matrix.m41, matrix.m42);
        },
        /**
         * Compute visited vectors
         */
        getVisited: () => {
          const { anim: { currentTime }, data, path } = state.api;
          if (currentTime === null) return [];
          const found = data.sofars.findIndex(l => l >= currentTime / 15 );
          if (found === -1) return [];
          // NOTE 1st item might be the NPC position, rather than start of path
          return path.slice(0, found);
        },
        isPaused: () => state.api.anim.playState === 'paused',
        isPlaying: () => state.api.anim.playState === 'running',
        isFinished: () => state.api.anim.playState === 'finished',
        setPath: (path) => state.api.path = path,
        togglePaused: () => {
          if (state.api.isFinished()) {
            return;
          } else if (state.api.isPaused()) {
            state.api.anim.play();
          } else {
            state.api.anim.pause();
          }
        },
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
        radius={24}
        onChange={() => {
          const { api, api: { path } } = state;
          if (!path.length) {
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
          const angs = edges.map(e => Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x).toFixed(2));

          const wasPaused = api.anim.playState === 'paused';
          api.anim.cancel?.();

          // TODO careful about breaking polyfill
          api.anim = state.bot.animate(
            rPath.flatMap((p, i) => [{
              offset: total ? sofars[i] / total : 0,
              transform: `translate(${p.x}px, ${p.y}px) rotateZ(${angs[i - 1] || 0}rad)`,
            }, {
              offset: total ? sofars[i] / total : 0,
              transform: `translate(${p.x}px, ${p.y}px) rotateZ(${angs[i] || 0}rad)`,
            }]),
            { duration: total * 15, direction: 'normal', fill: 'forwards' },
          );

          if (wasPaused || (api.data.count === 0 && api.initPaused)) {
            api.anim.pause();
          }

          api.data = { count: api.data.count + 1, edges, elens, sofars, total };
        }}
      />
    
      <g
        className="bot"
        ref={(el) => {
          if (el && (state.bot !== el)) {
            state.bot = el;
            state.bot.animate([
              { transform: `translate(0px, 0px)` }, // Extra frame For polyfill
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

