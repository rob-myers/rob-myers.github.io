import { useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generate } from 'shortid';
import { Act } from '@store/level.duck';
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
  /** Is a cursor direction highlighted? (editMode 'make') */
  const highlighted = useRef(false);
  /** Key of the meta mouse is over (editMode 'meta') */
  const overMeta = useRef<string>();
  /** Is the mouse held down? */
  const mouseIsDown = useRef(false);
  /** Are we showing a drag indicator? (editMode 'meta) */
  const metaIsDragged = useRef<string>();

  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const metaUis = useMemo(() => Object.values(state.metaUi), [state.metaUi]);
  const dispatch = useDispatch();
  const td = state.cursorType === 'refined' ? smallTileDim : tileDim;

  const trackMeta = () => {// Track meta under mouse
    const { mouseWorld } = state;
    const nextMeta = state.editMode === 'meta' && metaUis.find(({ position: { x, y } }) =>
      Math.pow(mouseWorld.x - x, 2) + Math.pow(mouseWorld.y - y, 2) <= Math.pow(metaPointRadius, 2));
    const nextKey = nextMeta ? nextMeta.key : undefined;
    if (nextKey !== overMeta.current) {
      overMeta.current && dispatch(Act.updateMetaUi(levelUid, overMeta.current, { over: false }));
      nextKey && dispatch(Act.updateMetaUi(levelUid, nextKey, { over: true }));
      overMeta.current = nextKey;
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
    
    if (state.editMode === 'make') {// Track edge highlighting
      const mm = new Vector2(posModulo(mouseWorld.x, td), posModulo(mouseWorld.y, td));
      const highlight: LevelUiState['cursorHighlight'] = {
        n: mm.y <= wallDepth,
        e: mm.x >= td - wallDepth,
        s: mm.y >= td - wallDepth,
        w: mm.x <= wallDepth,
      };
      highlighted.current = highlight.n || highlight.e || highlight.s || highlight.w || false;
      dispatch(Act.updateLevel(levelUid, { cursorHighlight: highlight }));
    }

    if (state.editMode === 'meta') {// Track meta under mouse
      trackMeta();
      /**
       * TODO show line indicator instead, moving only when release.
       * could set into state and draw line inside LevelMeta
       */
      // if (metaIsDragged.current) {
      //   dispatch(Thunk.moveMetaToMouse({ uid: levelUid, metaKey: metaIsDragged.current }));
      // }
    }
  };
  
  return (
    <rect
      className={css.mouseRect}
      onMouseMove={onMouseMove}
      onMouseDown={() => {
        mouseIsDown.current = true;
        metaIsDragged.current = overMeta.current;
      }}
      onMouseUp={() => {
        mouseIsDown.current = false;
        metaIsDragged.current = undefined;
        const key = overMeta.current;
        key && dispatch(Act.updateMetaUi(levelUid, key, { open: !state.metaUi[key].open }));
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
          case 'meta': {
            if (overMeta.current) {
              // Handled by mouseDown/Up
            } else {
              const metaKey = `meta-${generate()}`;
              worker.postMessage({
                key: 'add-level-meta',
                levelUid,
                position: state.mouseWorld.json,
                metaKey,
              });
              overMeta.current = metaKey;
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
