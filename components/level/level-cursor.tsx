import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState } from '@model/level/level.model';

function snapToGrid(world: Vector2, td: number) {
  world.x = Math.floor(world.x / td) * td;
  world.y = Math.floor(world.y / td) * td;
  return world;
}

const LevelCursor: React.FC<Props> = ({
  tileDim,
  levelUid,
}) => {
  const cursor = useRef(new Vector2(0, 0));
  const mouseIsDown = useRef(false);
  const [, forceUpdate] = useState();
  const _worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);

  // const toggleTile = () => {
  //   worker.postMessage({
  //     key: 'toggle-level-tile',
  //     levelUid,
  //     tile: cursor.current.json,
  //   });
  // };
  
  return (
    <>
      <rect
        className={css.mouseRect}
        onMouseMove={(e) => {
          const mouseWorld = getMouseWorld(e, state);
          snapToGrid(mouseWorld, tileDim);
          if (!cursor.current.equals(mouseWorld)) {
            cursor.current = mouseWorld;
            forceUpdate({});
            // mouseIsDown.current && toggleTile();
          }
        }}
        onMouseDown={(_e) => {
          mouseIsDown.current = true;
          // toggleTile();
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
}

function getMouseWorld(e: React.MouseEvent, state: LevelUiState) {
  const svgPos = getRelativePos(e);
  return new Vector2(
    state.renderBounds.x + (svgPos.x / state.zoomFactor),
    state.renderBounds.y + (svgPos.y / state.zoomFactor),
  );
}

export default LevelCursor;
