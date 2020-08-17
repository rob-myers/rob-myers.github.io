import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Vector, Rect } from '@model/geom/geom.model';
import { getRelativePos } from '@model/dom.model';
import css from './env.scss';

const EnvMouse: React.FC<Props> = ({ envKey }) => {
  const rectEl = useRef<SVGRectElement>(null);
  const dispatch = useDispatch();

  const onMouseMove = (e: React.MouseEvent | MouseEvent) => {
    const env = dispatch({ type: '[env] get env', args: { envKey } })!;
    const relPos = getRelativePos(e);
    const mouseWorld = new Vector(
      env.renderBounds.x + (relPos.x / env.zoom),
      env.renderBounds.y + (relPos.y / env.zoom),
    );
    dispatch({ type: '[env] update env', pay: { envKey, updates: {
      mouseScreen: Vector.from(relPos),
      mouseWorld,
    }}});
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault(); // Prevent page from scrolling
    const env = dispatch({ type: '[env] get env', args: { envKey } })!;

    /**
     * NOTE e.ctrlKey is true when pinch zoom in/out
     */
    if (e.ctrlKey) {// Zoom
      const nextZoom = env.zoom - 0.05 * e.deltaY;
      if (Math.abs(e.deltaY) > 0.1 && nextZoom > 0.3) {
        // const relPos = getRelativePos(e); // Zoom to mouse
        const relPos = env.screenCenter; // Zoom to center
        
        dispatch({ type: '[env] update env', pay: { envKey, updates: {
          zoom: nextZoom,
          // Preserve world position of `relPos`
          renderBounds: new Rect(
            env.renderBounds.x + relPos.x * (1 / env.zoom - 1 / nextZoom),
            env.renderBounds.y + relPos.y * (1 / env.zoom - 1 / nextZoom),
            env.screenDim.x / nextZoom,
            env.screenDim.y / nextZoom,
          ),
        }}});
      }
    } else {// Pan
      onMouseMove(e);
      const k = 0.5 / env.zoom;
      dispatch({ type: '[env] update env', pay: { envKey, updates: {
        renderBounds: env.renderBounds.clone().translate(k * e.deltaX, k * e.deltaY),
      }}});
    }
  };

  // Focus EnvKeys
  const onMouseEnter = () => {
    rectEl.current?.parentElement?.parentElement?.parentElement?.focus();
  };

  useEffect(() => {
    const onResize = () => {// Ensure rectangle 100% on resize
      const el = rectEl.current;
      if (el && el.parentElement) {
        el.style.setProperty('width', `${el.parentElement.clientWidth}px`);
        el.style.setProperty('height', `${el.parentElement.clientHeight}px`);
      }
    };
    window.addEventListener('resize', onResize);
    rectEl.current!.addEventListener('wheel', onWheel, false);

    return () => {
      window.removeEventListener('resize', onResize);
      rectEl.current?.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <rect
      ref={rectEl}
      className={css.mouseRect}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
    />
  );
};

interface Props {
  envKey: string;
}


export default EnvMouse;
