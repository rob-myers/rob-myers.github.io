import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { MessageFromLevelWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';
import { NavGraph } from '@model/nav/nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import css from './level.scss';

const LevelContent: React.FC<Props> = ({ levelUid }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const worker = useSelector(({ level: { worker } }) => worker)!;
  /** e.g. "M4,3 L33,2 ..." */
  const [outlines, setOutlines] = useState([] as string[]);
  const [walls, setWalls] = useState([] as string[]);
  const [floors, setFloors] = useState([] as string[]);
  const [triangles, setTriangles] = useState([] as string[]);

  const [centers, setCenters] = useState([] as Vector2[]);
  const [segs, setSegs] = useState([] as Vector2[][]);

  useEffect(() => {
    const sub = fromEvent<Message<MessageFromLevelWorker>>(worker, 'message')
      .pipe(
        map(({ data }) => data),
        tap((msg) => {
          if (msg.key === 'send-level-outline' && msg.levelUid === levelUid) {
            setOutlines(msg.outlinePoly.map(x => Poly2.fromJson(x).svgPath));
          }
          if (msg.key === 'send-level-walls' && msg.levelUid === levelUid) {
            setWalls(msg.walls.map(x => Poly2.fromJson(x).svgPath));
            setFloors(msg.floors.map(x => Poly2.fromJson(x).svgPath));
          }
          if (msg.key === 'send-level-tris' && msg.levelUid === levelUid) {
            setTriangles(msg.tris.map(x => Poly2.fromJson(x).svgPath));
          }
          if (msg.key === 'send-nav-graph' && msg.levelUid === levelUid) {
            /**
             * Testing: show nav-graph
             */
            const navGraph = NavGraph.fromJson(msg.navGraph);
            const floors = msg.floors.map(floor => Poly2.fromJson(floor));
            const { centers, segs } = navGraph.dualGraph(floors);
            setCenters(centers);
            setSegs(segs);
          }
        })
      ).subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <>
      {outlines.map((pathDef, i) =>
        <path key={i} fill="rgba(230,230,230,0.15)" d={pathDef} />
      )}
      {walls.map((pathDef, i) =>
        <path key={i} fill="rgba(0,0,0,0.8)" d={pathDef} />
      )}
      <g className={css.navigable}>
        {floors.map((pathDef, i) =>
          <path key={i} fill="rgba(50,50,50,0.1)" d={pathDef} />
        )}
      </g>
      {
        triangles.map((pathDef, i) => (
          <path
            key={i}
            d={pathDef}
            fill="none"
            stroke="#888"
            strokeWidth={0.1}
          />
        ))
      }
      {/* TESTING */}
      <g>
        {centers.map(({ x, y }, i) => (
          <circle
            key={i}
            cx={x} cy={y} r={2}
            className={css.svgNavNode}
          />
        ))}
      </g>
      <g>
        {segs.map(([ src, dst ], i) => (
          <line
            key={i}
            x1={src.x} y1={src.y}
            x2={dst.x} y2={dst.y}
            className={css.svgNavEdge}
          />
        ))}
      </g>
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelContent;
