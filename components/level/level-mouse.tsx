import { useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generate } from 'shortid';
import { ReplaySubject } from 'rxjs';
import { Act, Thunk } from '@store/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getRelativePos } from '@model/dom.model';
import { LevelUiState, wallDepth, computeLineSegs, tileDim, smallTileDim, ForwardedWheelEvent } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';
import { metaPointRadius } from '@model/level/level-meta.model';
import { redact } from '@model/redux.model';
import css from './level.scss';

function snapToGrid({ x, y }: Vector2, td: number) {
  return new Vector2(Math.floor(x / td) * td, Math.floor(y / td) * td);
}

const LevelMouse: React.FC<Props> = ({ levelUid }) => {
  const rectEl = useRef<SVGRectElement>(null);
  /** Is a cursor border highlighted? */
  const highlighted = useRef(false);
  /** Key of the meta the mouse is over */
  const overMeta = useRef<string>();
  /** Is the mouse held down? */
  const mouseIsDown = useRef(false);
  /** Is the mouse dragging and has moved? */
  const mouseIsDrag = useRef(false);
  /** Pan-zoom handler */
  const onWheel = useRef<(e: React.WheelEvent) => void>(() => null);

  const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const metaUis = useMemo(() => Object.values(state.metaUi), [state.metaUi]);
  const dispatch = useDispatch();
  const td = state.cursorType === 'refined' ? smallTileDim : tileDim;

  useEffect(() => {// Handle fowarded pan-zooms from LevelMetas
    const wheelForwarder = redact(new ReplaySubject<ForwardedWheelEvent>());
    const sub = wheelForwarder.subscribe((msg) => onWheel.current(msg.e));
    dispatch(Act.updateLevel(levelUid, { wheelForwarder }));

    const onResize = () => {// Ensure rectangle 100% on window resize
      if (rectEl.current) {
        rectEl.current.style.setProperty('min-width', '100%');
        rectEl.current.style.setProperty('min-height', '100%');
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      sub.unsubscribe();
      dispatch(Act.updateLevel(levelUid, { wheelForwarder: null }));
      window.removeEventListener('resize', onResize);
    };
  }, []);


  const setCursor = (cursor: 'auto' | 'pointer') =>
    rectEl.current?.style.setProperty('cursor', cursor);

  const trackMeta = () => {// Track meta under mouse
    const { mouseWorld } = state;
    const nextMeta = metaUis.find(({ position: { x, y } }) =>
      Math.pow(mouseWorld.x - x, 2) + Math.pow(mouseWorld.y - y, 2) <= Math.pow(0.5 + metaPointRadius, 2));
    const nextKey = nextMeta ? nextMeta.key : undefined;
    if (nextKey !== overMeta.current) {
      overMeta.current && dispatch(Act.updateMetaUi(levelUid, overMeta.current, { over: false }));
      nextKey && dispatch(Act.updateMetaUi(levelUid, nextKey, { over: true }));
      setCursor(nextKey ? 'pointer' : 'auto');
      overMeta.current = nextKey;
    }
    if (mouseIsDrag.current && !state.draggedMeta) {
      dispatch(Act.updateLevel(levelUid, { draggedMeta: nextKey }));
    }
  };

  useEffect(() => {// Adjust cursor position on change cursor
    dispatch(Act.updateLevel(levelUid, { cursor: snapToGrid(state.mouseWorld, td) }));
  }, [state.cursorType]);

  const onMouseMove = (e: React.MouseEvent) => {
    const relPos = getRelativePos(e, rectEl.current!);
    const mouseWorld = new Vector2(
      state.renderBounds.x + (relPos.x / state.zoomFactor),
      state.renderBounds.y + (relPos.y / state.zoomFactor),
    );
    dispatch(Act.updateLevel(levelUid, { cursor: snapToGrid(mouseWorld, td), mouseWorld }));
    
    // Track edge highlighting
    const mm = new Vector2(posModulo(mouseWorld.x, td), posModulo(mouseWorld.y, td));
    const highlight: LevelUiState['cursorHighlight'] = {
      n: mm.y <= wallDepth,
      e: mm.x >= td - wallDepth,
      s: mm.y >= td - wallDepth,
      w: mm.x <= wallDepth,
    };
    dispatch(Act.updateLevel(levelUid, { cursorHighlight: highlight }));
    highlighted.current = highlight.n || highlight.e || highlight.s || highlight.w || false;
    
    trackMeta();
  };
  
  onWheel.current = (e) => {
    // console.log({ deltaX: e.deltaX, deltaY: e.deltaY }); // Safari issue?
    if (e.shiftKey) {// Zoom
      const nextZoom = state.zoomFactor - 0.005 * e.deltaY;
      if (Math.abs(e.deltaY) > 0.1 && nextZoom > 0.3) {
        const relPos = getRelativePos(e, rectEl.current!);

        dispatch(Act.updateLevel(levelUid, {
          zoomFactor: nextZoom,
          // Preserve world position of mouse
          renderBounds: state.renderBounds.clone().delta(
            relPos.x * (1 / state.zoomFactor - 1 / nextZoom),
            relPos.y * (1 / state.zoomFactor - 1 / nextZoom),
          ),
        }));
      }
    } else {// Pan
      onMouseMove(e);
      const k = 0.5 / state.zoomFactor;
      dispatch(Act.updateLevel(levelUid, {
        renderBounds: state.renderBounds
          .clone().delta(k * e.deltaX, k * e.deltaY)
      }));
    }
  };

  return (
    <rect
      ref={rectEl}
      className={css.mouseRect}
      onMouseLeave={() => {// Cleanup
        const overKey = overMeta.current;
        overKey && dispatch(Act.updateMetaUi(levelUid, overKey, { over: false }));
        overMeta.current = undefined;
        mouseIsDrag.current = false;
        state.draggedMeta && dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
        setCursor('auto');
      }}
      onMouseMove={onMouseMove}
      onMouseDown={() => {
        mouseIsDown.current = true;
        mouseIsDrag.current = true;
      }}
      onMouseUp={(e) => {
        mouseIsDown.current = false;
        if (overMeta.current && !state.draggedMeta) {// Toggle meta dialog
          dispatch(Act.updateMetaUi(levelUid, overMeta.current, {
            open: !state.metaUi[overMeta.current].open,
          }));
          dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
        } else if (state.draggedMeta) {
          if (overMeta.current && overMeta.current !== state.draggedMeta ) {
            // NOOP
          } else if (e.shiftKey) {// Duplicate meta
            const newMetaKey = `meta-${generate()}`;
            worker.postMessage({
              key: 'duplicate-level-meta',
              levelUid,
              position: state.mouseWorld.json,
              metaKey: state.draggedMeta,
              newMetaKey,
            });
            dispatch(Act.updateLevel(levelUid, { draggedMeta: undefined }));
            dispatch(Act.updateMetaUi(levelUid, newMetaKey, { over: true }));
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
        } else if (e.shiftKey) {// Create new meta
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
        mouseIsDrag.current = false;
      }}
      onClick={(e) => {
        if (overMeta.current || e.shiftKey) {
          // NOOP
        } else if (highlighted.current) {
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

      }}
      onWheel={onWheel.current}
    />
  );
};

interface Props {
  levelUid: string;
}


export default LevelMouse;
