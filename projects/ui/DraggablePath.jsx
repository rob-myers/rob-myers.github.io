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
      src: Vect.from(props.initial.src),
      dst: Vect.from(props.initial.dst),

      /** @param {Geom.Vect[]} path */
      setPath: (path) => {
        state.path = path;
        state.pathEl.setAttribute('points', `${state.path}`);
      },
      updatePath: () => {
        const groupId = pathfinding.getGroup(props.zoneKey, state.src);
        if (groupId !== null) {
          /**
           * TODO
           * - state.src --> npc --> state.dst
           */
          state.path = [state.src.clone()].concat(
            pathfinding.findPath(state.src, state.dst, props.zoneKey, groupId)?.path || []
          );
          state.setPath(state.path);
          props.onChange?.(state.path);
        }
      },
      /** @param {Vect} p */
      pointInZone: (p) => {
        /**
         * TODO precompute below when zone available
         */
        const zone = pathfinding.zones[props.zoneKey];
        const nodes = zone.groups.flatMap(x => x);
        const tris = nodes.map(({ vertexIds }) => vertexIds.map(id => zone.vertices[id]));
        return tris.some(([u, v, w]) => Poly.pointInTriangle(p, u, v, w));
      },
    }
  });

  /**
   * TODO optionally initially updatePath()
   */
  React.useEffect(() => {
    if (props.zoneKey in pathfinding.zones) {
      state.updatePath();
    }
  }, [pathfinding.zones[props.zoneKey]]);

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
        initial={props.initial.src}
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
        initial={props.initial.dst}
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
 * @property {{ src: Geom.VectJson; dst: Geom.VectJson }} initial
 * @property {string} zoneKey
 * @property {UiTypes.IconKey} [srcIcon]
 * @property {UiTypes.IconKey} [dstIcon]
 * @property {number} [radius]
 * @property {(path: Geom.Vect[]) => void} [onChange]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 * @property {string} [stroke]
 */
