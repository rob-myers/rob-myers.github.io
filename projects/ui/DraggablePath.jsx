import { getSvgPos } from 'projects/service/dom';
import React from 'react';
import { Poly, Vect } from '../geom';
import { pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from './DraggableNode';

/** @param {Props} props */
export default function DraggablePath(props) {

  const [state] = React.useState(() => {
    return {
      /** @type {SVGPolylineElement} */
      pathEl: ({}), // TODO maybe force render instead
      path: /** @type {Geom.Vect[]} */ ([]),
      src: Vect.from(props.initSrc),
      dst: Vect.from(props.initDst),
      tris: /** @type {Vect[][]} */ ([]),

      /** @param {Geom.Vect[]} path */
      setPath: (path) => {
        state.path = path;
        state.pathEl.setAttribute('points', `${state.path}`);
      },
      updatePath: () => {
        const groupId = pathfinding.getGroup(props.zoneKey, state.src);
        if (groupId === null) {
          return console.warn(`pathfinding.getGroup: ${state.src.x},${state.src.y}: no group found`);
        }

        if (props.npcApi) {
          // src --> npc --> dst
          const npcPos = props.npcApi.getPosition();
          const pre = pathfinding.findPath(state.src, npcPos, props.zoneKey, groupId)?.path || [];
          const post = pathfinding.findPath(npcPos, state.dst, props.zoneKey, groupId)?.path || [];
          state.path = [state.src.clone()].concat(pre, post);
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
          state.pathEl = /** @type {SVGPolylineElement} */ (rootEl.querySelector('polyline.navpath'));
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
          state.updatePath();
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
          state.updatePath();
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
