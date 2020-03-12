import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Act } from '@store/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState, wallDepth } from '@model/level/level.model';
import { positiveModulo } from '@model/generic.model';
import css from './level.scss';

function snapToGrid(world: Vector2, td: number) {
  return new Vector2(
    Math.floor(world.x / td) * td,
    Math.floor(world.y / td) * td,
  );
}

const LevelMouse: React.FC<Props> = ({ tileDim, levelUid }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const highlighted = useRef(false);
  const dispatch = useDispatch();

  const toggleTile = () => {
    state && worker.postMessage({
      key: 'toggle-level-tile',
      levelUid,
      tile: state.cursor.json,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const mouseWorld = getMouseWorld(e, state);
    const mouseModulo = new Vector2(
      positiveModulo(mouseWorld.x, tileDim),
      positiveModulo(mouseWorld.y, tileDim),
    );
    const highlight: LevelUiState['cursorHighlight'] = {
      n: mouseModulo.y <= wallDepth,
      e: mouseModulo.x >= tileDim - wallDepth,
      s: mouseModulo.y >= tileDim - wallDepth,
      w: mouseModulo.x <= wallDepth,
    };
    highlighted.current = highlight.n || highlight.e || highlight.s || highlight.w || false;
    dispatch(Act.updateLevel(levelUid, {
      cursor: snapToGrid(mouseWorld, tileDim),
      cursorHighlight: highlight,
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
            toggleTile();
          }
        }}
        onWheel={(e) => {
          if (e.shiftKey && state) {// Zoom
            const nextZoom = state.zoomFactor - 0.005 * e.deltaY;
            if (Math.abs(e.deltaY) > 0.1 && nextZoom > 0.3) {
              // Preserve world position of mouse
              const { x, y } = getRelativePos(e);
              const renderBounds = state.renderBounds.clone().delta(
                x * (1 / state.zoomFactor - 1 / nextZoom),
                y * (1 / state.zoomFactor - 1 / nextZoom),
              );
              dispatch(Act.updateLevel(levelUid, { zoomFactor: nextZoom, renderBounds }));
            }
          } else {// Pan
            onMouseMove(e);
            const renderBounds = state.renderBounds.clone()
              .delta(0.5 * e.deltaX, 0.5 * e.deltaY);
            dispatch(Act.updateLevel(levelUid, { renderBounds }));
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
