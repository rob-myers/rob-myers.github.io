import { useRef, useState } from 'react';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';
import { useSelector } from 'react-redux';

function snapToGrid(worldX: number, worldY: number, td: number) {
  return new Vector2(Math.floor(worldX / td) * td, Math.floor(worldY / td) * td);
}

const LevelCursor: React.FC<Props> = ({
  root,
  tileDim,
  levelUid,
  width,
  height,
}) => {
  const cursor = useRef(new Vector2(0, 0));
  const mouseIsDown = useRef(false);
  const [, forceUpdate] = useState();
  const worker = useSelector(({ level: { worker } }) => worker)!;

  const toggleTile = () => {
    worker.postMessage({
      key: 'toggle-level-tile',
      levelUid,
      tile: cursor.current.json,
    });
  };
  
  return (
    <>
      <rect
        className={css.mouseRect}
        style={{ width, height }}
        onMouseMove={(e) => {
          const { clientX, clientY } = e;
          const { x: ox, y: oy } = root.current!.getBoundingClientRect();
          const nextCursor = snapToGrid(clientX - ox, clientY - oy, tileDim);
          if (!cursor.current.equals(nextCursor)) {
            cursor.current = nextCursor;
            forceUpdate({});
            mouseIsDown.current && toggleTile();
          }
        }}
        onMouseDown={(_e) => {
          mouseIsDown.current = true;
          toggleTile();
        }}
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
  width: number;
  height: number;
}

export default LevelCursor;
