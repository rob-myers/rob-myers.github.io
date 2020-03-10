import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState } from '@model/level/level.model';
import { Act } from '@store/level.duck';

function snapToGrid(world: Vector2, td: number) {
  world.x = Math.floor(world.x / td) * td;
  world.y = Math.floor(world.y / td) * td;
  return world;
}

const LevelCursor: React.FC<Props> = ({
  tileDim,
  levelUid,
}) => {
  const mouseIsDown = useRef(false);
  const _worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const dispatch = useDispatch();

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
          const cursor = snapToGrid(getMouseWorld(e, state), tileDim);
          if (state && !state.cursor.equals(cursor)) {
            // console.log({ x: cursor.x, y: cursor.y });
            dispatch(Act.updateLevel(levelUid, { cursor }));
            // mouseIsDown.current && toggleTile();
          }
        }}
        onMouseDown={(_e) => {
          mouseIsDown.current = true;
          // toggleTile();
        }}
        onMouseUp={(_e) => mouseIsDown.current = false}
        onWheel={(e) => {
          if (e.shiftKey && state) {// Zoom
            const { zoomFactor } = state;
            const nextZoom = zoomFactor - 0.005 * e.deltaY;
            if (Math.abs(e.deltaY) > 0.1 && nextZoom > 0.3) {
              // Preserve world position of mouse
              const { x: svgPosX, y: svgPosY } = getRelativePos(e);
              const renderBounds = state.renderBounds.clone().delta(
                svgPosX * 1 * (1 / zoomFactor - 1 / nextZoom),
                svgPosY * 1 * (1 / zoomFactor - 1 / nextZoom),
              );
              dispatch(Act.updateLevel(levelUid, { zoomFactor: nextZoom, renderBounds }));
            }
          } else {
            // TODO
          }
        }}
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
