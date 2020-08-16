import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Vector } from '@model/geom/geom.model';
import { getRelativePos } from '@model/dom.model';
import css from './env.scss';

const EnvMouse: React.FC<Props> = ({ envKey }) => {
  const rectEl = useRef<SVGRectElement>(null);
  /** Is the mouse held down? */
  const mouseIsDown = useRef(false);
  /** Pan-zoom handler */
  const onWheel = useRef<(e: WheelEvent) => void>(() => {});

  const state = useSelector(({ env: { instance } }) => instance[envKey]);
  const dispatch = useDispatch();

  useEffect(() => {
    const onResize = () => {// Ensure rectangle 100% on resize
      const el = rectEl.current;
      if (el && el.parentElement) {
        el.style.setProperty('width', `${el.parentElement.clientWidth}px`);
        el.style.setProperty('height', `${el.parentElement.clientHeight}px`);
      }
    };
    window.addEventListener('resize', onResize);

    const onWheelEvent = (e: WheelEvent) => onWheel.current(e);
    rectEl.current!.addEventListener('wheel', onWheelEvent, false);

    return () => {
      window.removeEventListener('resize', onResize);
      rectEl.current?.removeEventListener('wheel', onWheelEvent);
    };
  }, []);

  const onMouseMove = (e: React.MouseEvent | MouseEvent) => {
    const relPos = getRelativePos(e);
    const mouseWorld = new Vector(
      state.renderBounds.x + (relPos.x / state.zoom),
      state.renderBounds.y + (relPos.y / state.zoom),
    );
    dispatch({ type: '[env] update env', pay: { envKey, updates: { mouseWorld } } });
  };
  
  onWheel.current = (e) => {
    e.preventDefault(); // Prevent page from scrolling

    // console.log({ deltaX: e.deltaX, deltaY: e.deltaY }); // Safari issue?
    if (e.shiftKey) {// Zoom
      const nextZoom = state.zoom - 0.005 * e.deltaY;
      if (Math.abs(e.deltaY) > 0.1 && nextZoom > 0.3) {
        const relPos = getRelativePos(e);

        dispatch({ type: '[env] update env', pay: { envKey, updates: {
          zoom: nextZoom,
          // Preserve world position of mouse
          renderBounds: state.renderBounds.clone().translate(
            relPos.x * (1 / state.zoom - 1 / nextZoom),
            relPos.y * (1 / state.zoom - 1 / nextZoom),
          ),
        }}});
      }
    } else {// Pan
      onMouseMove(e);
      const k = 0.5 / state.zoom;
      dispatch({ type: '[env] update env', pay: { envKey, updates: {
        renderBounds: state.renderBounds.clone().translate(k * e.deltaX, k * e.deltaY),
      }}});
    }
  };

  return (
    <rect
      ref={rectEl}
      className={css.mouseRect}
      onMouseEnter={// Focus EnvKeys
        () => rectEl.current?.parentElement?.parentElement?.parentElement?.focus()
      }
      onMouseMove={onMouseMove}
      onMouseDown={() => {
        mouseIsDown.current = true;
      }}
      onMouseUp={(e) => {
        mouseIsDown.current = false;
      }}
      // onWheel={onWheel.current}
    />
  );
};

interface Props {
  envKey: string;
}


export default EnvMouse;
