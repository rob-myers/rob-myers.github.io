import { useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generate } from 'shortid';
import { Act, Thunk } from '@store/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState, wallDepth, computeLineSegs, tileDim, smallTileDim } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';
import { metaPointRadius } from '@model/level/level-meta.model';
import css from './level.scss';

function snapToGrid({ x, y }: Vector2, td: number) {
  return new Vector2(Math.floor(x / td) * td, Math.floor(y / td) * td);
}

const LevelMouse: React.FC<Props> = ({ levelUid }) => {
  const rectEl = useRef<SVGRectElement>(null);
  /** Is a cursor direction highlighted? (editMode 'make') */
  const highlighted = useRef(false);
  /** Key of meta the mouse is over (editMode 'meta') */
  const overMeta = useRef<string>();
  /** Is the mouse held down? */
  const mouseIsDown = useRef(false);

  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const metaUis = useMemo(() => Object.values(state.metaUi), [state.metaUi]);
  const dispatch = useDispatch();
  const td = state.cursorType === 'refined' ? smallTileDim : tileDim;

  const setCursor = (cursor: 'auto' | 'pointer') =>
    rectEl.current?.style.setProperty('cursor', cursor);
  const trackMeta = () => {// Track meta under mouse
    const { mouseWorld } = state;
    const nextMeta = state.editMode === 'meta' && metaUis.find(({ position: { x, y } }) =>
      Math.pow(mouseWorld.x - x, 2) + Math.pow(mouseWorld.y - y, 2) <= Math.pow(0.5 + metaPointRadius, 2));
    const nextKey = nextMeta ? nextMeta.key : undefined;
    if (nextKey !== overMeta.current) {
      overMeta.current && dispatch(Act.updateMetaUi(levelUid, overMeta.current, { over: false }));
      nextKey && dispatch(Act.updateMetaUi(levelUid, nextKey, { over: true }));
      overMeta.current = nextKey;
      setCursor(nextKey ? 'pointer' : 'auto');
    }
  };

  useEffect(() => {// Adjust cursor position on change cursor
    dispatch(Act.updateLevel(levelUid, { cursor: snapToGrid(state.mouseWorld, td) }));
  }, [state.cursorType]);

  useEffect(() => {// Track meta on change edit mode
    if (state.editMode === 'make' && overMeta.current) {
      dispatch(Act.updateMetaUi(levelUid, overMeta.current, { over: false }));
      overMeta.current = undefined;
    } else if (state.editMode === 'meta') {
      trackMeta();
    }
  }, [state.editMode]);

  const onMouseMove = (e: React.MouseEvent) => {
    const mouseWorld = getMouseWorld(e, state);
    dispatch(Act.updateLevel(levelUid, { cursor: snapToGrid(mouseWorld, td), mouseWorld }));
    
    switch (state.editMode) {
      case 'make': {
        // Track edge highlighting
        const mm = new Vector2(posModulo(mouseWorld.x, td), posModulo(mouseWorld.y, td));
        const highlight: LevelUiState['cursorHighlight'] = {
          n: mm.y <= wallDepth,
          e: mm.x >= td - wallDepth,
          s: mm.y >= td - wallDepth,
          w: mm.x <= wallDepth,
        };
        highlighted.current = highlight.n || highlight.e || highlight.s || highlight.w || false;
        dispatch(Act.updateLevel(levelUid, { cursorHighlight: highlight }));
        break;
      }
      case 'meta': {
        trackMeta();
        break;
      }
    }
  };
  
  return (
    <rect
      ref={rectEl}
      className={css.mouseRect}
      onMouseLeave={() => {// We cleanup
        const overKey = overMeta.current;
        overKey && dispatch(Act.updateMetaUi(levelUid, overKey, { over: false }));
        overMeta.current = undefined;
        state.draggedMeta && dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
        setCursor('auto');
      }}
      onMouseMove={onMouseMove}
      onMouseDown={() => {
        mouseIsDown.current = true;
        dispatch(Act.updateLevel(levelUid, { draggedMeta: overMeta.current }));
      }}
      onMouseUp={(e) => {
        mouseIsDown.current = false;
        switch (state.editMode) {
          case 'meta': {
            if (overMeta.current) {// Toggle meta dialog
              dispatch(Act.updateMetaUi(levelUid, overMeta.current, {
                open: !state.metaUi[overMeta.current].open,
              }));
              dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
            } else if (state.draggedMeta) {
              if (overMeta.current) {
                break;
              } else if (e.shiftKey) {// Duplicate meta
                const newMetaKey = `meta-${generate()}`;
                worker.postMessage({
                  key: 'duplicate-level-meta',
                  levelUid,
                  position: state.mouseWorld.json,
                  metaKey: state.draggedMeta,
                  newMetaKey,
                });
                dispatch(Act.updateMetaUi(levelUid, state.draggedMeta, { over: true }));
                dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
                overMeta.current = newMetaKey;
                setCursor('pointer');
                worker.postMessage({ key: 'request-level-metas', levelUid });
              } else { // Move meta
                dispatch(Thunk.moveMetaToMouse({ uid: levelUid, metaKey: state.draggedMeta }));
                dispatch(Act.updateMetaUi(levelUid, state.draggedMeta, { over: true }));
                dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
                overMeta.current = state.draggedMeta;
                setCursor('pointer');
              }
            } else {// Create new meta
              const metaKey = `meta-${generate()}`;
              worker.postMessage({
                key: 'add-level-meta',
                levelUid,
                position: state.mouseWorld.json,
                metaKey,
              });
              overMeta.current = metaKey;
              setCursor('pointer');
              worker.postMessage({ key: 'request-level-metas', levelUid });
            }
            break;
          }
        }
      }}
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
          case 'meta': {// Handled by onMouseUp
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
            renderBounds: state.renderBounds
              .clone().delta(0.25 * e.deltaX, 0.25 * e.deltaY)
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
