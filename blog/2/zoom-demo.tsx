import shortid from 'shortid';
import { useRef, useEffect, useState } from 'react';
const svgPanZoom = import('svg-pan-zoom');

import { getRelativePos } from '@model/dom.model';
import { Vector } from '@model/geom/geom.model';
import css from './zoom-demo.scss';

const dim = { x: 600, y: 300 };
const tileDim = 10;
const initialHeight = 100;

const ZoomDemo: React.FC = () => {
  const svg = useRef<SVGSVGElement>(null);
  const ctm = useRef<DOMMatrix>(new DOMMatrix);
  const uid = useRef(shortid.generate());
  const gridId = `zoom-grid-${uid.current}`;
  const bigGridId = `zoom-big-grid-${uid.current}`;
  const viewportId = `zoom-viewport-${uid.current}`;
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [worldPos, setWorldPos] = useState({ x: 0, y: 0 });
  const [height, setHeight] = useState(initialHeight);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    svgPanZoom.then(module => module.default(svg.current!, {
      viewportSelector: `#${viewportId}`,
      onPan: (_point) => {
        // Panned to point
      },
      onZoom: (scale) => {
        setZoom(Number(scale.toFixed(1)));
        setHeight(Math.round(initialHeight / scale));
      },
      onUpdatedCTM: (nextCtm) => {
        // Must convert SVGMatrix into DOMMatrix
        ctm.current = DOMMatrix.fromMatrix(nextCtm).inverse();
      },
      fit: true,
    }));
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    const mousePos = Vector.from(getRelativePos(e)).round();
    const worldPos = Vector.from(ctm.current!.transformPoint(mousePos)).round();
    setMousePos(mousePos);
    setWorldPos(worldPos);
  };

  return (
    <div>
      <div className={css.info}>
        mouse({mousePos.x},{mousePos.y}) | 
        world({worldPos.x},{worldPos.y}) |
        zoom({zoom}) |
        height({height})
      </div>
      <svg
        className={css.root}
        ref={svg}
        style={{ width: dim.x, height: dim.y }}
        onMouseMove={onMouseMove}
      >
        <defs>
          <pattern id={gridId} width={tileDim} height={tileDim} patternUnits="userSpaceOnUse">
            <path
              className={css.gridPath}
              d={`M ${tileDim} 0 L 0 0 0 ${tileDim}`}
              fill="none"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern id={bigGridId} width={tileDim * 5} height={tileDim * 5} patternUnits="userSpaceOnUse">
            <path
              className={css.gridPath}
              d={`M ${tileDim * 5} 0 L 0 0 0 ${tileDim * 5}`}
              fill="none"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <g id={viewportId}>
          <rect x={tileDim} y={tileDim} width={2 * tileDim} height={ 2 * tileDim} fill="red" />
          <rect x={dim.x - 3 * tileDim} y={dim.y - 3 *tileDim} width={2 * tileDim} height={2 * tileDim} fill="red" />
          <rect
            className={css.gridRect}
            width="100%"
            height="100%"
            fill={`url(#${gridId})`}
          />
          <rect
            className={css.gridRect}
            width="100%"
            height="100%"
            fill={`url(#${bigGridId})`}
          />
        </g>
      </svg>
    </div>
  );
};

export default ZoomDemo;
