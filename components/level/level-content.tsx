import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';
import { NavGraph } from '@model/nav/nav-graph.model';
import { Vector2, Vector2Json } from '@model/vec2.model';
import css from './level.scss';

const LevelContent: React.FC<Props> = ({ levelUid, showNavGraph = false }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;

  const [tileFloors, setTileFloors] = useState([] as string[]);
  const [walls, setWalls] = useState([] as [Vector2Json, Vector2Json][]);
  const [floors, setFloors] = useState([] as string[]);
  const [triangles, setTriangles] = useState([] as string[]);
  // debug
  const [centers, setCenters] = useState([] as Vector2[]);
  const [segs, setSegs] = useState([] as Vector2[][]);

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
        case 'send-nav-graph': {// Debug
          if (showNavGraph) {
            const navGraph = NavGraph.fromJson(msg.navGraph);
            const floors = msg.floors.map(floor => Poly2.fromJson(floor));
            const { centers, segs } = navGraph.dualGraph(floors);
            setCenters(centers);
            setSegs(segs);
          }
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
      <g className={css.wallSeg}>
        {walls.map(([u, v], i) =>
          <line key={i} x1={u.x} y1={u.y} x2={v.x} y2={v.y} />
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
      {showNavGraph && (// TODO move to LevelMetas
        <g>
          {centers.map(({ x, y }, i) => (
            <circle
              key={i}
              cx={x} cy={y} r={2}
              className={css.svgNavNode}
            />
          ))}
          {segs.map(([ src, dst ], i) => (
            <line
              key={i}
              x1={src.x} y1={src.y}
              x2={dst.x} y2={dst.y}
              className={css.svgNavEdge}
            />
          ))}
        </g>
      )}
    </>
  );
};

interface Props {
  levelUid: string;
  showNavGraph?: boolean;
}

export default LevelContent;
