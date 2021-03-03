import { useRef } from 'react';
import { posModulo } from 'model/generic.model';
import { tileDim } from 'model/stage.model';
import styles from 'styles/Stage.module.css';
import { Vector2 } from 'model/geom/vec2.model';

const StageGrid: React.FC<Props> = ({ stageKey, offset, zoomFactor }) => {
  const gridId = useRef(`grid-${stageKey}`);
  // Compute grid pattern offset
  const dx = -posModulo(offset.x, tileDim);
  const dy = -posModulo(offset.y, tileDim);

  return (
    <>
      <defs>
        <pattern id={gridId.current} x={dx} y={dy} width={tileDim} height={tileDim} patternUnits="userSpaceOnUse">
          <path
            className={styles.svgRefinedPath}
            d={`M ${tileDim} 0 L 0 0 0 ${tileDim}`}
            fill="none"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect
        className={styles.svgGrid}
        width={`${100 / zoomFactor}%`}
        height={`${100 / zoomFactor}%`}
        fill={`url(#${gridId.current})`}
        // fill={`url(${location.href}#small-${gridId.current})`}
      />
    </>
  );
};

interface Props {
  stageKey: string;
  offset: Vector2;
  zoomFactor: number;
}

export default StageGrid;
