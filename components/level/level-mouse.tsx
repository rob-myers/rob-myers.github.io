import { useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Act, Thunk } from '@store/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState, wallDepth, computeLineSegs, tileDim, smallTileDim } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';
import css from './level.scss';
import { metaPointRadius } from '@model/level/level-meta.model';

function snapToGrid({ x, y }: Vector2, td: number) {
  return new Vector2(Math.floor(x / td) * td, Math.floor(y / td) * td);
}

const LevelMouse: React.FC<Props> = ({ levelUid }) => {
  const highlighted = useRef(false);
  const overMetaKey = useRef<string>();
  const mouseIsDown = useRef(false);

  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const metaUis = useMemo(() => Object.values(state.metaUi), [state.metaUi]);
  const dispatch = useDispatch();
  const td = state.cursorType === 'refined' ? smallTileDim : tileDim;

  useEffect(() => {
    dispatch(Act.updateLevel(levelUid, {
      cursor: snapToGrid(state.mouseWorld, td),
    }));
  }, [state.cursorType]);

  const onMouseMove = (e: React.MouseEvent) => {
    /** Mouse world */
    const mw = getMouseWorld(e, state);
    /** Mouse world modulo tile (small or large) */
    const mm = new Vector2(posModulo(mw.x, td), posModulo(mw.y, td));
    /** Track edge highlighting */
    const highlight: LevelUiState['cursorHighlight'] = {
      n: mm.y <= wallDepth,
      e: mm.x >= td - wallDepth,
      s: mm.y >= td - wallDepth,
      w: mm.x <= wallDepth,
    };
    highlighted.current = highlight.n || highlight.e || highlight.s || highlight.w || false;
    dispatch(Act.updateLevel(levelUid, {
      cursor: snapToGrid(mw, td),
      cursorHighlight: highlight,
      mouseWorld: mw,
    }));
    /** Meta under mouse */
    const nextMeta = state.editMode === 'meta' && metaUis
      .find(({ position: { x, y } }) =>
        Math.pow(mw.x - x, 2) + Math.pow(mw.y - y, 2) <= Math.pow(metaPointRadius, 2));
    const nextKey = nextMeta ? nextMeta.key : undefined;
    if (nextKey !== overMetaKey.current) {
      overMetaKey.current && dispatch(Act.updateMetaUi(levelUid, overMetaKey.current, { over: false }));
      nextKey && dispatch(Act.updateMetaUi(levelUid, nextKey, { over: true }));
      overMetaKey.current = nextKey;
    }

    if (overMetaKey.current && mouseIsDown.current) {
      dispatch(Thunk.moveMetaToMouse({ uid: levelUid, metaKey: overMetaKey.current }));
    }
  };
  
  return (
    <rect
      className={css.mouseRect}
      onMouseMove={onMouseMove}
      onMouseDown={() => mouseIsDown.current = true}
      onMouseUp={() => mouseIsDown.current = false}
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
            if (overMetaKey.current) {
              const key = overMetaKey.current;
              dispatch(Act.updateMetaUi(levelUid, key, { open: !state.metaUi[key].open }));
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
