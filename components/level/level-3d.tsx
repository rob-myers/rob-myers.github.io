import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2Json, Vector2 } from '@model/vec2.model';
import css from './level.scss';

const Level3d: React.FC<{ levelUid: string }> = ({ levelUid }) => {
  const containerEl = useRef<HTMLDivElement>(null);
  const tempPoint = useRef(Vector2.zero);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const mouseWorld = useSelector(({ level: { instance } }) => instance[levelUid].mouseWorld);
  const [tileFloors, setTileFloors] = useState([] as Poly2[]);
  const [_walls, setWalls] = useState([] as [Vector2Json, Vector2Json][]);
  const [dimension, setDimension] = useState<Vector2>();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if ('levelUid' in msg && msg.levelUid !== levelUid) return;
      if (msg.key === 'send-level-layers') {
        setTileFloors(msg.tileFloors.map(x => Poly2.fromJson(x)));
        setWalls(msg.wallSegs);
      }
    });
    worker.postMessage({ key: 'request-level-data', levelUid });

    const onResize = () => {
      const viewportEl = containerEl.current!.parentElement!.parentElement!;
      setDimension(new Vector2(viewportEl.clientWidth, viewportEl.clientHeight));
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      sub.unsubscribe();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={containerEl}
      className={css.containerThreeD}
      style={dimension && {
        perspectiveOrigin: `${100 * (mouseWorld.x / dimension.x)}% ${100 * (mouseWorld.y / dimension.y)}%`,
        width: dimension.x,
        height: dimension.y,
      }}
    >
      {tileFloors.map(({ lineSegs }, i) => (
        lineSegs.map(([u, v], j) => {
          tempPoint.current.copy(v).sub(u);
          return (
            <div
              key={`${i}-${j}`}
              style={{
                position: 'absolute',
                transformOrigin: 'top left',
                transform: `translate(${u.x}px, ${u.y}px) rotateZ(${tempPoint.current.angle}rad) rotateX(90deg)`,
                width: tempPoint.current.length,
                background: 'rgba(0, 0, 0, 1)',
                height: 300,
              }}
            >
            </div>
          );
        })
      ))}
    </div>
  );
};

export default Level3d;
