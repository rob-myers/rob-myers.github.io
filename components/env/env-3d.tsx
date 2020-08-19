import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Vector } from '@model/geom/vector.model';
import css from './env.scss';

const Env3d: React.FC<Props> = ({ envKey }) => {
  const containerEl = useRef<HTMLDivElement>(null);
  const tempPoint = useRef(Vector.zero);
  
  const [wallSegs, setWallSegs] = useState([
    // TEMP
    { u: new Vector(100, 100), v: new Vector(100, 200), backface: true },
    { u: new Vector(300, 100), v: new Vector(400, 100), backface: true },
  ] as { u: Vector; v: Vector; backface: boolean }[]);
  const [dimension, setDimension] = useState<Vector>();

  // const mouseWorld = useSelector(({ env: { instance } }) => instance[envKey].mouseWorld);
  const renderBounds = useSelector(({ env }) => env[envKey].renderBounds);
  const zoomFactor = useSelector(({ env }) => env[envKey].zoom);
  
  const scale = `scale(${zoomFactor})`;
  const translate = `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;
  const center = renderBounds.center;

  useEffect(() => {
    const onResize = () => {
      const viewportEl = containerEl.current?.parentElement?.parentElement;
      viewportEl && setDimension(new Vector(viewportEl.clientWidth, viewportEl.clientHeight));
    };
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const geometry = useMemo(() =>
    wallSegs.map(({ u, v, backface }, i) => {
      tempPoint.current.copy(u).sub(v);
      return (
        <div
          key={`wall-${i}`}
          className={classNames(css.wall, !backface && css.cullBackface)}
          style={{
            transform: `translate3d(${v.x}px, ${v.y}px, 0px) rotateZ(${tempPoint.current.angle}rad) rotateX(90deg)`,
            width: tempPoint.current.length,
          }}
        />
      );
    })
  , [wallSegs]);

  return (
    <div
      className={css.containerThreeD}
      style={{ transform: `${scale} ${translate}` }}
    >
      <div
        ref={containerEl}
        className={css.parentThreeD}
        style={dimension && {
          // perspectiveOrigin: `${100 * (mouseWorld.x / dimension.x)}% ${100 * (mouseWorld.y / dimension.y)}%`,
          perspectiveOrigin: `${100 * (center.x / dimension.x)}% ${100 * (center.y / dimension.y)}%`,
          width: dimension.x,
          height: dimension.y,
        }}
      >
        {geometry}
      </div>
    </div>
  );
};

interface Props {
  envKey: string;
  /** We'll read from this geometry */
  geomKey: string;
}

export default Env3d;
