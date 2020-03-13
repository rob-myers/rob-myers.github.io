import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Act } from '@store/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState, wallDepth } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';
import css from './level.scss';

function snapToGrid({ x, y }: Vector2, td: number) {
  return new Vector2(Math.floor(x / td) * td, Math.floor(y / td) * td);
}

const LevelMouse: React.FC<Props> = ({ tileDim, levelUid }) => {
  const highlighted = useRef(false);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const dispatch = useDispatch();

  useEffect(() => {
    const td = state.cursorType === 'refined' ? tileDim/3 : tileDim;
    dispatch(Act.updateLevel(levelUid, {
      cursor: snapToGrid(state.mouseWorld, td),
    }));
  }, [state.cursorType]);

  const onMouseMove = (e: React.MouseEvent) => {
    const td = state.cursorType === 'refined' ? tileDim/3 : tileDim;
    const mouseWorld = getMouseWorld(e, state);
    const mouseModulo = new Vector2(posModulo(mouseWorld.x, td), posModulo(mouseWorld.y, td));
    const highlight: LevelUiState['cursorHighlight'] = {
      n: mouseModulo.y <= wallDepth,
      e: mouseModulo.x >= td - wallDepth,
      s: mouseModulo.y >= td - wallDepth,
      w: mouseModulo.x <= wallDepth,
    };
    highlighted.current = highlight.n || highlight.e || highlight.s || highlight.w || false;
    dispatch(Act.updateLevel(levelUid, {
      cursor: snapToGrid(mouseWorld, td),
      cursorHighlight: highlight,
      mouseWorld,
    }));
  };
  
  return (
    <>
      <rect
        className={css.mouseRect}
        onMouseMove={onMouseMove}
        onClick={(_e) => {
          if (highlighted.current) {
            console.log('HIGHLIGHT', state.cursorHighlight);
          } else {
            worker.postMessage({
              key: 'toggle-level-tile',
              levelUid,
              tile: state.cursor.json,
            });
          }
        }}
        onWheel={(e) => {
          if (e.shiftKey && state) {// Zoom
            const nextZoom = state.zoomFactor - 0.005 * e.deltaY;
            if (Math.abs(e.deltaY) > 0.1 && nextZoom > 0.3) {
              const { x, y } = getRelativePos(e);
              dispatch(Act.updateLevel(levelUid, {
                zoomFactor: nextZoom,
                // Preserve world position of mouse
                renderBounds: state.renderBounds.clone().delta(
                  x * (1 / state.zoomFactor - 1 / nextZoom),
                  y * (1 / state.zoomFactor - 1 / nextZoom),
                ),
              }));
            }
          } else {// Pan
            onMouseMove(e);
            dispatch(Act.updateLevel(levelUid, {
              renderBounds: state.renderBounds.clone()
                .delta(0.5 * e.deltaX, 0.5 * e.deltaY)
            }));
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

export default LevelMouse;
