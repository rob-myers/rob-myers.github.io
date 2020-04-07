import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2Json } from '@model/vec2.model';
import css from './level.scss';

const LevelContent: React.FC<Props> = ({ levelUid }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;

  const [tileFloors, setTileFloors] = useState([] as string[]);
  const [walls, setWalls] = useState([] as [Vector2Json, Vector2Json][]);
  const [floors, setFloors] = useState([] as string[]);
  const [triangles, setTriangles] = useState([] as string[]);

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      // console.log({ levelContentReceived: msg });
      if ('levelUid' in msg && msg.levelUid !== levelUid) {
        return;
      }
      switch (msg.key) {
        case 'send-level-layers': {
          setTileFloors(msg.tileFloors.map(x => Poly2.fromJson(x).svgPath));
          setWalls(msg.wallSegs);
          break;
        }
        case 'send-level-nav-floors': {
          setFloors(msg.navFloors.map(x => Poly2.fromJson(x).svgPath));
          break;
        }
        case 'send-level-tris': {
          setTriangles(msg.tris.map(x => Poly2.fromJson(x).svgPath));
          break;
        }
      }
    });
    worker.postMessage({ key: 'request-level-data', levelUid });
    return () => sub.unsubscribe();
  }, []);

  return (
    <>
      <g className={css.baseFloor}>
        {tileFloors.map((pathDef, i) =>
          <path key={i} d={pathDef} />
        )}
      </g>
      <g className={css.navigable}>
        {floors.map((pathDef, i) =>
          <path key={i} d={pathDef} />
        )}
      </g>
      <g className={css.triangle}>
        {triangles.map((pathDef, i) => (
          <path key={i} d={pathDef} />
        ))}
      </g>
      <g className={css.wallSeg}>
        {walls.map(([u, v], i) =>
          <line key={i} x1={u.x} y1={u.y} x2={v.x} y2={v.y} />
        )}
      </g>
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelContent;
