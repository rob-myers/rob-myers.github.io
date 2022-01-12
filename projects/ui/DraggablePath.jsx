import React from 'react';
import { Poly, Vect } from '../geom';
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from './DraggableNode';

/**
 * TODO distinguish fullPath and animPath
 */

/** @param {Props} props */
export default function DraggablePath(props) {

  const [state] = React.useState(() => {
    return {
      pathEl: /** @type {SVGPolylineElement} */ ({}),
      redsEl: /** @type {SVGGElement} */ ({}),

      /** Path used to generate animation (subpath of `fullPath`) */
      animPath: /** @type {Geom.Vect[]} */ ([]),
      /** Visual path with draggable nodes either end */
      fullPath: /** @type {Geom.Vect[]} */ ([]),
      srcApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      dstApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      tris: /** @type {Vect[][]} */ ([]),
      lastGroupId: /** @type {null | number} */ (null),

      /** @param {Vect} dst */
      updateAnimPath: (dst) => {
        if (props.npcApi && state.lastGroupId !== null) {
          const npcPos = props.npcApi.getPosition();
          const nextPath = pathfinding.findPath(npcPos, dst, props.zoneKey, state.lastGroupId)?.path || [];
          state.animPath = [Vect.from(npcPos)].concat(nextPath);
          // TODO remove
          state.srcApi.moveTo(npcPos);
          state.dstApi.moveTo(dst);
        }
      },
      /** @param {Geom.Vect[]} path */
      renderFullPath: () => {
        state.pathEl.setAttribute('points', `${state.fullPath}`);
        // TODO test: render reds
      },
      /**
       * Update on change endpoint (and initially).
       * @param {'src' | 'dst'} [changedEnd]
       */
      updateFullPath: (changedEnd) => {
        const dst = (changedEnd || 'dst') === 'dst' ? state.dstApi.getPosition() : state.srcApi.getPosition();
        const groupId = pathfinding.getGroup(props.zoneKey, dst);
        if (groupId === null) {
          return console.warn(`pathfinding: ${dst.x}, ${dst.y}: no group found`);
        }

        state.lastGroupId = groupId;
        state.updateAnimPath(dst);
        state.fullPath = state.animPath.slice();
        state.renderFullPath();
        // Provide the path to animate to parent NPC
        props.onChange?.(state.animPath);
      },
      /** @param {Geom.Vect} p */
      pointInZone: (p) => {
        return state.tris.some(([u, v, w]) => Poly.pointInTriangle(p, u, v, w));
      },
      /**
       * @param {Geom.Vect} nodeCurrent 
       * @param {Geom.Vect} nodeNext 
       * @param {Geom.Vect} nodeOther 
       */
      shouldCancel: (nodeCurrent, nodeNext, nodeOther) => {
        if (!state.pointInZone(nodeNext)) {
          return true;
        }
        const dragging = nodeCurrent.distanceTo(nodeNext) >= 20;
        const npcPos = props.npcApi.getPosition();
        return dragging && (
          nodeNext.distanceTo(npcPos) <= 2 * props.radius // Near NPC
          || nodeNext.distanceTo(nodeOther) <= 2 * props.radius // Near other node
        );
      },
    }
  });

  React.useEffect(() => {
    if (props.zoneKey in pathfinding.zones) {
      const zone = pathfinding.zones[props.zoneKey];
      const nodes = zone?.groups.flatMap(x => x)??[];
      state.tris = nodes.map(({ vertexIds }) => vertexIds.map(id => zone.vertices[id]));
      state.updateFullPath(); // Initial update
    }
  }, [props.zoneKey in pathfinding.zones]);

  return (
    <g
      ref={(rootEl) => {
        if (rootEl) {
          state.pathEl = /** @type {*} */ (rootEl.querySelector('polyline.navpath'));
          state.redsEl = /** @type {*} */ (rootEl.querySelector('g.reds'));
        }
      }}
    >
      <polyline
        className="navpath"
      />
      <g
        className="reds"
      />

      <DraggableNode
        initial={props.initSrc}
        radius={props.radius}
        icon={props.srcIcon}
        onStart={() => props.onStart?.('src')}
        onStop={() => {
          state.updateFullPath('src');
        }}
        onLoad={(api) => {
          state.srcApi = api;
          api.moveTo(props.initSrc);
        }}
        onClick={() => {
          /**
           * IN PROGRESS
           */
          if (props.npcApi.isFinished()) {
            // Reverse fullPath and follow it 
            state.fullPath.reverse();
            state.renderFullPath();
            state.srcApi.moveTo(state.fullPath[0]);
            state.dstApi.moveTo(state.fullPath[0]);
            // state.updateAnimPath(state.animPath[state.animPath.length - 1]);
            state.animPath = state.fullPath.slice();
            props.onChange?.(state.animPath);
          } else if (props.npcApi.isPaused() && state.animPath.length) {
            // TODO set animPath as path back to start
            // state.animPath = state.getPathBack();

            // OLD approach
            state.updateAnimPath(state.animPath[0].clone());
            state.pathEl.setAttribute('points', `${state.animPath}`);
            props.onChange?.(state.animPath);
          } else {
            props.npcApi.togglePaused();
          }
        }}
        shouldCancel={(current, next) => {
          return state.shouldCancel(current, next, state.dstApi.getPosition());
        }}
      />
      <DraggableNode
        initial={props.initDst}
        radius={props.radius}
        icon={props.dstIcon}
        onStart={() => props.onStart?.('dst')}
        onStop={() => {
          state.updateFullPath('dst');
        }}
        onLoad={(api) => {
          state.dstApi = api;
          api.moveTo(props.initDst);
        }}
        onClick={() => {
          props.npcApi?.togglePaused();
        }}
        shouldCancel={(current, next) => {
          return state.shouldCancel(current, next, state.srcApi.getPosition());
        }}
      />
    </g>
  );

}

/**
 * @typedef Props @type {object}
 * @property {Geom.VectJson} initSrc
 * @property {Geom.VectJson} initDst
 * @property {string} zoneKey
 * @property {number} radius
 * @property {NPC.Api} npcApi
 * @property {UiTypes.IconKey} [srcIcon]
 * @property {UiTypes.IconKey} [dstIcon]
 * @property {string} [stroke]
 * @property {(animPath: Geom.Vect[]) => void} [onChange]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 */
