import React from "react";
import { css } from "goober";
import { Vect } from "../geom";
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from "./DraggableNode";
import { getInternalNpcApi, navNodeRadius } from "./npc-internals";
import DraggableRay from "./DraggableRay";

// TODO
// - listen for changes to props.npcs
// - generally speaking, ensure exactly one group in each zone

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const [state] = React.useState(() => {
    
    const { defs } = props;
    const groupIds = defs.map(def => pathfinding.getGroup(def.zoneKey, def.src)); // Assume zones exist
    groupIds.forEach((x, i) => x === null && console.warn(`NPC: ${defs[i].key}: init.src: ${defs[i].src.x}, ${defs[i].src.y}: no group found`));

    // Each NPC has an API
    const apis = defs.map((def, i) => {
      /** @type {NPC.NPCApi} */
      const api = {
        key: def.key,
        def,
        el: {
          npc: /** @type {SVGGElement} */ ({}),
          look: /** @type {SVGLineElement} */ ({}),
          path: /** @type {SVGPolylineElement} */ ({}),
          dots: /** @type {SVGGElement} */ ({}),
        },
        srcApi: /** @type {NPC.DraggableNodeApi} */ ({}),
        dstApi: /** @type {NPC.DraggableNodeApi} */ ({}),
        rayApi: /** @type {NPC.DraggableRayApi} */ ({}),

        move: /** @type {Animation} */ ({}),
        look: /** @type {Animation} */ ({}),
        geom: { animPath: [], navPath: [], navPathPolys: [] },
        aux: { groupId: groupIds[i], count: 0, edges: [], elens: [], sofars: [], total: 0, angs: [] },

        getPosition() {
          // https://stackoverflow.com/a/4976554/2917822
          const matrix = new DOMMatrixReadOnly(window.getComputedStyle(api.el.npc).transform);
          return new Vect(matrix.m41, matrix.m42);
        },
        getLookAngle() {
          const matrix = new DOMMatrixReadOnly(window.getComputedStyle(api.el.look).transform);
          return Math.atan2(matrix.m12, matrix.m11);
        },
        getNPCAngle() {
          const matrix = new DOMMatrixReadOnly(window.getComputedStyle(api.el.npc).transform);
          return Math.atan2(matrix.m12, matrix.m11);
        },
        pause() {
          if (api.move.playState === 'running') {
            api.move.pause();
          }
        },
        play() {
          api.move.play();
          api.internal.resetLook();
        },

        internal: /** @type {*} */ (null),
      };
      api.internal = getInternalNpcApi(api)
      return api;
    });

    /** @type {NPC.NPCsApi} */
    const api = {
      apis,
      highlightPath(key) {
        state.apis.forEach(api => {
          if (api.key === key) api.el.path.classList.add('active');
          else api.el.path.classList.remove('active');
        });
      },
      // ...
    };
    props.onLoad(api);

    return {
      apis,
      api,
      /** Used to avoid reset on HMR */
      mounted: false,
      /** @type {React.RefCallback<SVGGElement>} */
      rootRef(el) {
        if (el && !state.mounted) {
          state.apis.forEach(api => {
            api.internal.initialize(el);
            api.internal.updateNavPath(Vect.from(api.def.dst));
            api.internal.followNavPath();
          });
          state.mounted = true;
        }
      },
    };
  });

  return (
    <g
      className={rootCss}
      ref={state.rootRef}
    >

      <g className="navpaths">
        {state.apis.map(api => 
          <g key={api.key}>
            <polyline className={`navpath ${api.key}`}/>
            <g className={`navdots ${api.key}`}/>
            <DraggableNode
              key="src"
              initial={api.def.src}
              radius={navNodeRadius}
              onLoad={nodeApi => api.srcApi = nodeApi}
              onStop={api.internal.onDraggedSrcNode}
              shouldCancel={(curr, next) => api.internal.shouldCancelNavDrag(curr, next, 'src')}
              onClick={api.internal.onClickedSrcNode}
            />
            <DraggableNode
              key="dst"
              initial={api.def.dst}
              radius={navNodeRadius}
              onLoad={nodeApi => api.dstApi = nodeApi}
              onStop={api.internal.onDraggedDstNode}
              shouldCancel={(curr, next) => api.internal.shouldCancelNavDrag(curr, next, 'dst')}
              onClick={api.internal.onClickedDstNode}
            />
          </g>
        )}
      </g>

      {state.apis.map(api => 
        <g key={api.key} className={`npc ${api.key}`}>
          <circle className="body" fill="#fff" stroke="black" strokeWidth={2} r={9} />
          <g className="look">
            <line className="body" stroke="black" strokeWidth={2} x2={9} />
          </g>
          <DraggableRay
            radius={9}
            onLoad={rayApi => api.rayApi = rayApi}
            onStop={api.internal.onDragLookRay}
            onClick={() => state.api.highlightPath(api.key)}
          />
        </g>
      )}

    </g>
  );
}

const rootCss = css`
  polyline.navpath {
    fill: none;
    stroke: #222;
    stroke-width: 1;
    stroke-dasharray: 1px;
  }
  polyline.navpath.active {
    stroke-width: 2;
    stroke: blue;
  }
`;
