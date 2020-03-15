import { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { KeyedLookup } from '@model/generic.model';
import { LevelPoint } from '@model/level/level-point.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import css from './level.scss';

const LevelMeta: React.FC<Props> = ({ levelUid, viewportRef }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const metaUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaUi)!;
  const [metaPoints, setMetaPoints] = useState<KeyedLookup<LevelPoint>>({});
  const points = useMemo(() => Object.values(metaPoints), [metaPoints]);

  console.log({ metaUi });

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-points' && msg.levelUid === levelUid) {
        setMetaPoints(msg.points.map(p => LevelPoint.fromJson(p))
          .reduce((agg, item) => ({ ...agg, [item.key]: item }), {}));
      }
    });
    worker.postMessage({ key: 'request-level-points', levelUid });
    return () => sub.unsubscribe();
  }, []);

  return (
    <>
      <g className={css.levelPoints}>
        {points.map(({ position, key }) =>
          <circle
            key={key}
            cx={position.x}
            cy={position.y}
            r={1}
            onClick={() => {
              console.log('CLICK');
            }}
          />
        )}
      </g>
      {// Popovers
        viewportRef.current && ReactDOM.createPortal(
          points.map(({ key }) => (
            <div
              key={key}
              className={css.metaPointsPopover}
            >
              {key}
            </div>
          ))
          , viewportRef.current)
      }
    </>
  );
};

interface Props {
  levelUid: string;
  viewportRef: React.RefObject<HTMLElement>;
}

export default LevelMeta;
