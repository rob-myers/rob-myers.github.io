import React from 'react';
import { Poly, Vect } from '../geom';
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from './DraggableNode';

/** @param {Props} props */
export default function DraggablePath(props) {

  const [state] = React.useState(() => {
    return {
      pathEl: /** @type {SVGPolylineElement} */ ({}),
      path: /** @type {Geom.Vect[]} */ ([]),
      srcApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      dstApi: /** @type {NPC.DraggableNodeApi} */ ({}),
      tris: /** @type {Vect[][]} */ ([]),
      lastGroupId: /** @type {null | number} */ (null),

      /** @param {Vect} dst */
      moveNpcTo: (dst) => {
        if (props.npcApi && state.lastGroupId !== null) {
          const npcPos = props.npcApi.getPosition();
          const nextPath = pathfinding.findPath(npcPos, dst, props.zoneKey, state.lastGroupId)?.path || [];
          state.path = [Vect.from(npcPos)].concat(nextPath);
          // TODO avoid setTimeout?
          setTimeout(() => {
            state.srcApi.moveTo(npcPos);
            state.dstApi.moveTo(dst);
          });
        }
      },
      /** @param {Geom.Vect[]} path */
      setPath: (path) => {
        state.path = path;
        state.pathEl.setAttribute('points', `${state.path}`);
      },
      /** @param {'src' | 'dst'} [changed] */
      updatePath: (changed) => {
        const dst = (changed || 'dst') === 'dst' ? state.dstApi.getPosition() : state.srcApi.getPosition();
        const groupId = pathfinding.getGroup(props.zoneKey, dst);

        if (groupId === null) {
          return console.warn(`pathfinding: ${dst.x}, ${dst.y}: no group found`);
        }

        state.lastGroupId = groupId;
        state.moveNpcTo(dst);
        state.setPath(state.path);
        props.onChange?.(state.path);
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
          return;
        }
        const dragging = nodeCurrent.distanceTo(nodeNext) >= 1;
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
      state.updatePath(); // TODO optional
    }
  }, [props.zoneKey in pathfinding.zones]);

  return (
    <g
      ref={(rootEl) => {
        if (rootEl) {
          state.pathEl = /** @type {*} */ (rootEl.querySelector('polyline.navpath'));
        }
      }}
    >
      <polyline className="navpath" />
      <DraggableNode
        initial={props.initSrc}
        radius={props.radius}
        icon={props.srcIcon}
        onStart={() => props.onStart?.('src')}
        onStop={() => {
          state.updatePath('src');
        }}
        onLoad={(api) => {
          state.srcApi = api;
          api.moveTo(props.initSrc);
        }}
        onClick={() => {
          if (props.npcApi.isFinished()) {
            state.path.reverse();
            state.srcApi.moveTo(state.path[0]);
            state.moveNpcTo(state.path[state.path.length - 1]);
            props.onChange?.(state.path);
          } else if (props.npcApi.isPaused() && state.path.length) {
            state.moveNpcTo(state.path[0].clone());
            state.setPath(state.path);
            props.onChange?.(state.path);
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
          state.updatePath('dst');
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
 * @property {(path: Geom.Vect[]) => void} [onChange]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 */
