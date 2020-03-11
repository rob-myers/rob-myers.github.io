import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Rect2 } from '@model/rect2.model';
import css from './level.scss';

const LevelGrid: React.FC<Props> = ({ tileDim: td, levelUid }) => {
  const gridId = useRef(`grid-${levelUid}`);
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const rect = state ? state.renderBounds : Rect2.zero;
  // Compute grid pattern offset.
  const dx = -(rect.x > 0 ? rect.x % td : (rect.x % td) + td);
  const dy = -(rect.y > 0 ? rect.y % td : (rect.y % td) + td);

  return (
    <>
      <defs>
        <pattern id={gridId.current} x={dx} y={dy} width={td} height={td} patternUnits="userSpaceOnUse">
          <path d={`M ${td} 0 L 0 0 0 ${td}`} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      {
        state && 
          <rect
            className={css.svgGrid}
            width={`${100 / state.zoomFactor}%`}
            height={`${100 / state.zoomFactor}%`}
            fill={`url(#${gridId.current})`}
          />
      }
    </>
  );
};

interface Props {
  levelUid: string;
  tileDim: number;
}

export default LevelGrid;
