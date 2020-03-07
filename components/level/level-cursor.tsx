import { useRef, useState, useEffect } from 'react';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';

function toGrid(x: number, td: number) {
  return Math.floor(x / td) * td;
}

const LevelCursor: React.FC<Props> = ({ root, tileDim, provideHandler }) => {
  const origin = useRef(new Vector2(0, 0));
  const [cursor, setCursor] = useState(new Vector2(0, 0));

  useEffect(() => {
    if (root.current) {
      const rect = root.current.getBoundingClientRect();
      origin.current.set(rect.x, rect.y);
      provideHandler((e) => {
        if (e) {
          const { clientX, clientY } = e;
          const { x: ox, y: oy } = origin.current;
          setCursor(new Vector2(toGrid(clientX - ox, tileDim), toGrid(clientY - oy, tileDim)));
        }
      });
    }
  }, [root.current]);

  return (
    <rect
      className={css.cursor}
      x={cursor.x}
      y={cursor.y}
      width={tileDim}
      height={tileDim}
    />
  );
};

interface Props {
  tileDim: number;
  root: React.RefObject<HTMLDivElement>;
  provideHandler: (onMouseMove: (e: React.MouseEvent) => void) => void;
}

export default LevelCursor;
