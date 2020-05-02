import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';
import { Rect2 } from '@model/rect2.model';
import { wallDepth } from '@model/level/level-params';
import { computeRectPartition } from '@model/level/geom.model';
import { MetaCuboid } from '@model/level/level-meta.model';

const Level3d: React.FC<{ levelUid: string }> = ({ levelUid }) => {
  const containerEl = useRef<HTMLDivElement>(null);
  const tempPoint = useRef(Vector2.zero);
  const [cuboids, setCuboids] = useState([] as MetaCuboid[]);
  const [wallSegs, setWallSegs] = useState([] as { u: Vector2; v: Vector2; backface: boolean }[]);
  const [dimension, setDimension] = useState<Vector2>();

  const mouseWorld = useSelector(({ level: { instance } }) => instance[levelUid].mouseWorld);
  const renderBounds = useSelector(({ level: { instance } }) => instance[levelUid].renderBounds);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const zoomFactor = useSelector(({ level: { instance } }) => instance[levelUid].zoomFactor);

  const scale = `scale(${zoomFactor})`;
  const translate = `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-layers' && msg.levelUid === levelUid) {

        const tileFloors = msg.tileFloors.map(x => Poly2.fromJson(x));
        const rectPolys = msg.wallSegs
          .map((pair) => pair.map(x => Vector2.from(x)))
          .map(([u, v]) => Rect2.from(u, v).outset(wallDepth).poly2);
        /** Outset inner walls restricted to tiles */
        const innerWallRects = computeRectPartition(
          Poly2.intersect(tileFloors, rectPolys)).flatMap(x => x);
        
        // Each inner wall induces 4 planes
        const innerWallSegs = innerWallRects
          .flatMap(({ topLeft, topRight, bottomRight, bottomLeft }) => [
            [topRight, topLeft],
            [bottomRight, topRight],
            [bottomLeft, bottomRight],
            [topLeft, bottomLeft],
          ] as [Vector2, Vector2][]);
        
        // Must inset outer walls to match inner walls
        const outerWallSegs = msg.tileFloors
          .flatMap(x => Poly2.fromJson(x).createInset(wallDepth))
          .flatMap(({ lineSegs }) => lineSegs);

        setWallSegs(
          innerWallSegs.map(([u, v]) => ({ u, v, backface: false })).concat(
            outerWallSegs.map(([u, v]) => ({ u, v, backface: false }))
          )
        );

        setCuboids(msg.cuboids.map(({ base, height }) => ({
          base: Rect2.fromJson(base),
          height,
        })));
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
    <>
      {
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
      }
      {
        cuboids.map(({ base, height }, i) => {
          return (
            <div
              key={`cuboid-${i}`}
              className={css.cuboid}
            >
              <div style={{ width: base.width, height: base.height, // top
                transform: `translate3d(${base.x}px, ${base.y}px, ${height}px)`,
              }} />
              <div style={{ width: base.width, height, // north
                transform: `translate(${base.x}px, ${base.y}px) rotateX(90deg)`,
              }}/>
              <div style={{ width: base.width, height, // south
                transform: `translate(${base.right}px, ${base.bottom}px) rotateZ(180deg) rotateX(90deg)`,
              }}/>
              <div style={{ width: height, height: base.height, // west
                transform: `translate(${base.x}px, ${base.y}px) rotateY(-90deg)`,
              }}/>
              <div style={{ width: height, height: base.height, // east
                transform: `translate(${base.right}px, ${base.bottom}px) rotateZ(180deg) rotateY(-90deg)`,
              }}/>
            </div>
          );
        })
      }
    </>
  , [wallSegs, cuboids]);

  return (
    <div
      className={css.threeDimContainer}
      style={{ transform: `${scale} ${translate}` }}
    >
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
    </div>
  );
};

export default Level3d;
