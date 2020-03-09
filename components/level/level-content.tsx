import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { MessageFromLevelWorker } from '@model/level/level.worker.model';
import { Poly2 } from '@model/poly2.model';

const LevelContent: React.FC<Props> = ({ levelUid }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const worker = useSelector(({ level: { worker } }) => worker)!;
  /** e.g. "M4,3 L33,2 ..." */
  const [outlines, setOutlines] = useState([] as string[]);
  const [walls, setWalls] = useState([] as string[]);
  const [floors, setFloors] = useState([] as string[]);
  const [triangles, setTriangles] = useState([] as string[]);

  useEffect(() => {
    const sub = fromEvent<Message<MessageFromLevelWorker>>(worker, 'message')
      .pipe(
        map(({ data }) => data),
        tap((msg) => {
          if (msg.key === 'send-level-grid' && msg.levelUid === levelUid) {
            setOutlines(msg.outlinePoly.map(x => Poly2.fromJson(x).svgPath));
          }
          if (msg.key === 'send-level-walls' && msg.levelUid === levelUid) {
            setWalls(msg.walls.map(x => Poly2.fromJson(x).svgPath));
            setFloors(msg.floors.map(x => Poly2.fromJson(x).svgPath));
          }
          if (msg.key === 'send-level-tris' && msg.levelUid === levelUid) {
            setTriangles(msg.tris.map(x => Poly2.fromJson(x).svgPath));
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
        <path key={i} fill="rgba(230,200,200,0.15)" d={pathDef} />
      )}
      {walls.map((pathDef, i) =>
        <path key={i} fill="rgba(0,0,0,0.8)" d={pathDef} />
      )}
      {floors.map((pathDef, i) =>
        <path key={i} fill="rgba(50,50,50,0.1)" d={pathDef} />
      )}
      {
        triangles.map((pathDef, i) => (
          <path
            key={i}
            d={pathDef}
            fill="none"
            stroke="#555"
            strokeWidth={0.1}
          />
        ))
      }
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelContent;
