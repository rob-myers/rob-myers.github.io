import { useRef, useState, useEffect } from 'react';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';
import { useSelector } from 'react-redux';

function snapToGrid(worldX: number, worldY: number, td: number) {
  return new Vector2(Math.floor(worldX / td) * td, Math.floor(worldY / td) * td);
}
function toTileCoords(cursor: Vector2, td: number) {
  return cursor.clone().scale(1 / td);
}

const LevelCursor: React.FC<Props> = ({ root, tileDim, levelUid }) => {
  const origin = useRef(new Vector2(0, 0));
  const cursor = useRef(new Vector2(0, 0));
  const mouseIsDown = useRef(false);
  const [, forceUpdate] = useState();
  const worker = useSelector(({ level: { worker } }) => worker)!;

  const onClick = (_e: React.MouseEvent) => {
    worker.postMessage({
      key: 'toggle-level-tile',
      levelUid,
      tile: toTileCoords(cursor.current, tileDim).json,
    });
  };

  useEffect(() => {
    if (root.current) {
      const rect = root.current.getBoundingClientRect();
      origin.current.set(rect.x, rect.y);
    }
  }, [root]);

  return (
    <>
      <rect
        className={css.mouseRect}
        onMouseMove={(e) => {
          const { clientX, clientY } = e;
          const { x: ox, y: oy } = origin.current;
          const nextCursor = snapToGrid(clientX - ox, clientY - oy, tileDim);
          if (!cursor.current.equals(nextCursor)) {
            cursor.current = nextCursor;
            forceUpdate({});
            mouseIsDown.current && onClick(e);
          }
        }}
        onClick={onClick}
        onMouseDown={(_e) => mouseIsDown.current = true}
        onMouseUp={(_e) => mouseIsDown.current = false}
      >
      </rect>
      <rect
        className={css.cursor}
        x={cursor.current.x}
        y={cursor.current.y}
        width={tileDim}
        height={tileDim}
      />
    </>
  );
};

interface Props {
  levelUid: string;
  tileDim: number;
  root: React.RefObject<HTMLDivElement>;
}

export default LevelCursor;
