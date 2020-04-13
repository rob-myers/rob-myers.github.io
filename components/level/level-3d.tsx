import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';
import { Rect2 } from '@model/rect2.model';

const Level3d: React.FC<{ levelUid: string }> = ({ levelUid }) => {
  const containerEl = useRef<HTMLDivElement>(null);
  const tempPoint = useRef(Vector2.zero);

  const mouseWorld = useSelector(({ level: { instance } }) => instance[levelUid].mouseWorld);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const [wallSegs, setWallSegs] = useState([] as { u: Vector2; v: Vector2; backface: boolean }[]);
  const [dimension, setDimension] = useState<Vector2>();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-layers' && msg.levelUid === levelUid) {

        // Each inner wall induces 4 planes
        const innerWallSegs = msg.wallSegs
          .map(([u, v]) => [Vector2.from(u), Vector2.from(v)])
          .map(([u, v]) => Rect2.from(u, v).outset(0.5))
          .flatMap(({ topLeft, topRight, bottomRight, bottomLeft }) => [
            [topRight, topLeft],
            [bottomRight, topRight],
            [bottomLeft, bottomRight],
            [topLeft, bottomLeft],
          ] as [Vector2, Vector2][]);
        
        // Must inset outer walls to match inner walls
        const outerWallSegs = msg.tileFloors
          .flatMap(x => Poly2.fromJson(x).createInset(0.5))
          .flatMap(({ lineSegs }) => lineSegs);

        setWallSegs(
          innerWallSegs.map(([u, v]) => ({ u, v, backface: false })).concat(
            outerWallSegs.map(([u, v]) => ({ u, v, backface: false }))
          )
        );
      }
    });
    worker.postMessage({ key: 'request-level-data', levelUid });

    const onResize = () => {
      const viewportEl = containerEl.current?.parentElement?.parentElement;
      viewportEl && setDimension(new Vector2(viewportEl.clientWidth, viewportEl.clientHeight));
    };
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      sub.unsubscribe();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const geometry = useMemo(() =>
    wallSegs.map(({ u, v, backface }, i) => {
      tempPoint.current.copy(u).sub(v);
      return (
        <div
          key={i}
          className={classNames(css.wall, !backface && css.cullBackface)}
          style={{
            transform: `translate(${v.x}px, ${v.y}px) rotateZ(${tempPoint.current.angle}rad) rotateX(90deg)`,
            width: tempPoint.current.length,
          }}
        >
        </div>
      );
    })
  , [wallSegs]);

  return (
    <div
      ref={containerEl}
      className={css.threeDimParent}
      style={dimension && {
        perspectiveOrigin: `${100 * (mouseWorld.x / dimension.x)}% ${100 * (mouseWorld.y / dimension.y)}%`,
        width: dimension.x,
        height: dimension.y,
      }}
    >
      {geometry}
    </div>
  );
};

export default Level3d;
