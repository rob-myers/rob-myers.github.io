import React from 'react';
import { Vect } from '../geom';
import { Pathfinding } from '../pathfinding/Pathfinding';
import DraggableNode from './DraggableNode';

/** @param {Props} props */
export default function DraggablePath(props) {

  const [state] = React.useState(() => ({
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
      }
    },
  }));

  return (
    <g
      ref={(rootEl) => {
        if (rootEl) {
          state.pathEl = /** @type {SVGPolylineElement} */ (rootEl.querySelector('polyline.navpath'));
          state.updatePath();
        }
      }}
    >
      <polyline
        className="navpath" 
        // points={`${props.path}`}
      />
      <DraggableNode
        initial={props.initial.src}
        radius={props.radius}
        icon={props.srcIcon}
        onStart={() => props.onStart?.('src')}
        onStop={(p) => {
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
 * @property {(position: Geom.Vect, type: 'src' | 'dst') => void} [onStop]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 * @property {string} [stroke]
 */
