import { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { LevelState } from '@model/level/level.model';
import { LevelPoint } from '@model/level/level-point.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Act } from '@store/level.duck';
import css from './level.scss';
import { Vector2 } from '@model/vec2.model';

type MetaPoints = LevelState['metaPoints'];

const LevelMeta: React.FC<Props> = ({ levelUid, overlayRef }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const [metaPoints, setMetaPoints] = useState<MetaPoints>({});
  const points = useMemo(() => Object.values(metaPoints), [metaPoints]);
  const metaUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaUi)!;
  const dispatch = useDispatch();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-points' && msg.levelUid === levelUid) {
        const metaPoints = msg.points.map(p => LevelPoint.fromJson(p))
          .reduce<MetaPoints>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
        setMetaPoints(metaPoints);
        dispatch(Act.ensureMetaUi(levelUid, Object.keys(metaPoints)));
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
            r={1.5}
            onClick={() => {
              dispatch(Act.updateMetaUi(levelUid, key, {
                open: !metaUi[key].open,
                position: new Vector2(position.x + 3, position.y),
              }));
            }}
          />
        )}
      </g>
      {// Popovers
        overlayRef.current && ReactDOM.createPortal(
          points.map(({ key }) => (
            metaUi[key] && <div
              key={key}
              className={classNames(css.metaPopover, {
                [css.open]: metaUi[key].open,
              })}
              style={{
                left: metaUi[key].position.x,
                top: metaUi[key].position.y,
              }}
            >
              {key}
            </div>
          ))
          , overlayRef.current)
      }
    </>
  );
};

interface Props {
  levelUid: string;
  overlayRef: React.RefObject<HTMLElement>;
}

export default LevelMeta;
