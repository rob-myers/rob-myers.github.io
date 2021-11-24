import React from 'react';
import { Poly, Vect } from '../geom';
import { Pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from './DraggableNode';

/** @param {Props} props */
export default function DraggablePath(props) {

  const [state] = React.useState(() => {

    // We assume props.pathfinding never changes
    const zone = props.pathfinding.zones[props.zoneKey];
    const nodes = zone.groups.flatMap(x => x);
    const tris = nodes.map(({ vertexIds }) => vertexIds.map(id => zone.vertices[id]));

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
        const groupId = props.pathfinding.getGroup(props.zoneKey, state.src);
        if (groupId !== null) {
          state.path = [state.src.clone()].concat(props.pathfinding.findPath(state.src, state.dst, props.zoneKey, groupId) || []);
          state.setPath(state.path);
          props.onChange?.(state.path);
        }
      },
      /** @param {Vect} p */
      pointInZone: (p) => {
        return tris.some(([u, v, w]) => Poly.pointInTriangle(p, u, v, w));
      },
    }
  });

  React.useEffect(() => state.updatePath(), []);

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
 * @property {Pathfinding} pathfinding
 * @property {string} zoneKey
 * @property {UiTypes.IconKey} [srcIcon]
 * @property {UiTypes.IconKey} [dstIcon]
 * @property {number} [radius]
 * @property {(path: Geom.Vect[]) => void} [onChange]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 * @property {string} [stroke]
 */
