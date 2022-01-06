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
      src: Vect.from(props.initSrc),
      dst: Vect.from(props.initDst),
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
        const groupId = pathfinding.getGroup(props.zoneKey, state.src);
        if (groupId === null) {
          return console.warn(`pathfinding: ${state.src.x}, ${state.src.y}: no group found`);
        }

        state.lastGroupId = groupId;
        if (props.npcApi) {// npc --> target
          const dst = state[changed || 'dst'];
          state.moveNpcTo(dst);
        } else {// src --> dst
          state.path = [state.src.clone()].concat(
            pathfinding.findPath(state.src, state.dst, props.zoneKey, groupId)?.path || []
          );
        }

        state.setPath(state.path);
        props.onChange?.(state.path);
      },
      /** @param {Vect} p */
      pointInZone: (p) => {
        return state.tris.some(([u, v, w]) => Poly.pointInTriangle(p, u, v, w));
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
        onStop={(p) => {
          if (!state.pointInZone(p)) return 'cancel';
          state.src.copy(p);
          state.updatePath('src');
        }}
        onLoad={(api) => state.srcApi = api}
        onClick={() => {
          if (props.npcApi) {
            if (props.npcApi.isFinished()) {
              state.path.reverse();
              state.srcApi.moveTo(state.path[0]);
              state.dstApi.moveTo(state.path[state.path.length - 1]);
              props.onChange?.(state.path);
            } else if (props.npcApi.isPaused() && state.path.length) {
              state.moveNpcTo(state.path[0].clone());
              state.setPath(state.path);
              props.onChange?.(state.path);
            } else {
              props.npcApi.togglePaused();
            }
          }
        }}
      />
      <DraggableNode
        initial={props.initDst}
        radius={props.radius}
        icon={props.dstIcon}
        onStart={() => props.onStart?.('dst')}
        onStop={(p) => {
          if (!state.pointInZone(p)) return 'cancel';
          state.dst.copy(p);
          state.updatePath('dst');
        }}
        onLoad={(api) => state.dstApi = api}
        onClick={() => {
          props.npcApi?.togglePaused();
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
 * @property {NPC.Api} [npcApi]
 * @property {UiTypes.IconKey} [srcIcon]
 * @property {UiTypes.IconKey} [dstIcon]
 * @property {number} [radius]
 * @property {string} [stroke]
 * @property {(path: Geom.Vect[]) => void} [onChange]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 */
