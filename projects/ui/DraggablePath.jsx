import React from 'react';
import DraggableNode from './DraggableNode';

/** @param {Props} props */
export default function DraggablePath(props) {

  const [state] = React.useState(() => ({
    /** @type {SVGPolylineElement} */
    pathEl: ({}),
    path: /** @type {Geom.Vect[]} */ ([]),
  }));

  React.useEffect(() => {
    /** @param {Geom.Vect[]} path */
    function setPath(path) {
      state.path = path;
      state.pathEl.setAttribute('points', `${state.path}`);
    };
    props.api({
      setPath,
    });
  }, []);

  return (
    <g
      ref={(rootEl) => {
        if (rootEl) {
          state.pathEl = /** @type {SVGPolylineElement} */ (rootEl.querySelector('polyline.navpath'));
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
        onStop={(p) => props.onStop?.(p, 'src')}
      />
      <DraggableNode
        initial={props.initial.dst}
        radius={props.radius}
        icon={props.dstIcon}
        onStart={() => props.onStart?.('dst')}
        onStop={(p) => props.onStop?.(p, 'dst')}
      />
    </g>
  );

}

/**
 * @typedef Props @type {object}
 * @property {{ src: Geom.VectJson; dst: Geom.VectJson }} initial
 * @property {(api: UiTypes.DraggablePathApi) => void} api
 * @property {UiTypes.IconKey} [srcIcon]
 * @property {UiTypes.IconKey} [dstIcon]
 * @property {number} [radius]
 * @property {(position: Geom.Vect, type: 'src' | 'dst') => void} [onStop]
 * @property {(type: 'src' | 'dst') => void} [onStart]
 * @property {string} [stroke]
 */
