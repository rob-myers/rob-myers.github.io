import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Act } from '@store/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState, wallDepth, computeLineSegs, tileDim, smallTileDim } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';
import { LevelMetaUi } from '@model/level/level-meta.model';
import css from './level.scss';

function snapToGrid({ x, y }: Vector2, td: number) {
  return new Vector2(Math.floor(x / td) * td, Math.floor(y / td) * td);
}

const LevelMouse: React.FC<Props> = ({ levelUid }) => {
  const highlighted = useRef(false);
  const overMetas = useRef<LevelMetaUi>();
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const dispatch = useDispatch();
  const td = state.cursorType === 'refined' ? smallTileDim : tileDim;

  useEffect(() => {
    dispatch(Act.updateLevel(levelUid, {
      cursor: snapToGrid(state.mouseWorld, td),
    }));
  }, [state.cursorType]);

  const onMouseMove = (e: React.MouseEvent) => {
    // Track mouse
    const mouseWorld = getMouseWorld(e, state);
    const mouseModulo = new Vector2(posModulo(mouseWorld.x, td), posModulo(mouseWorld.y, td));
    // Track edge highlighting
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
    // Track metas
    const nextOverMeta = state.editMode === 'meta' && Object.values(state.metaUi).find(({ position: { x, y } }) =>
      Math.pow(mouseWorld.x - x, 2) + Math.pow(mouseWorld.y - y, 2) <= 1.5 * 1.5);
    const some = nextOverMeta || overMetas.current;
    some && dispatch(Act.updateMetaUi(levelUid, some.key, { over: !!nextOverMeta }));
    overMetas.current = nextOverMeta || undefined;
  };
  
  return (
    <>
      <rect
        className={css.mouseRect}
        onMouseMove={onMouseMove}
        onClick={(_e) => {
          switch (state.editMode) {
            case 'make': {
              if (highlighted.current) {
                // console.log('HIGHLIGHT', state.cursorHighlight);
                const { cursorHighlight: h  } = state;
                const segs = [] as [Vector2, Vector2][];
                h.n && segs.push(...computeLineSegs(td, state.cursor, 'n'));
                h.e && segs.push(...computeLineSegs(td, state.cursor, 'e'));
                h.s && segs.push(...computeLineSegs(td, state.cursor, 's'));
                h.w && segs.push(...computeLineSegs(td, state.cursor, 'w'));
    
                worker.postMessage({
                  key: 'toggle-level-wall',
                  levelUid,
                  segs: segs.map(([u, v]) => [u.json, v.json]),
                });
              } else {
                worker.postMessage({
                  key: 'toggle-level-tile',
                  levelUid,
                  tile: state.cursor.json,
                  type: state.cursorType === 'default' ? 'large' : 'small',
                });
              }
              break;
            }
            case 'meta': {
              if (overMetas.current) {
                console.log('CLICK');
              } else {
                worker.postMessage({
                  key: 'add-level-meta',
                  levelUid,
                  position: state.mouseWorld.json,
                });
              }
              break;
            }
          }
        }}
        onWheelCapture={(e) => {
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
}

function getMouseWorld(e: React.MouseEvent, state: LevelUiState) {
  const svgPos = getRelativePos(e);
  return new Vector2(
    state.renderBounds.x + (svgPos.x / state.zoomFactor),
    state.renderBounds.y + (svgPos.y / state.zoomFactor),
  );
}

export default LevelMouse;
