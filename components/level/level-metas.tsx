import { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { LevelState } from '@model/level/level.model';
import { LevelMeta } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Act } from '@store/level.duck';
import css from './level.scss';

type MetaPoints = LevelState['metas'];

const LevelMetas: React.FC<Props> = ({ levelUid, overlayRef }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const [metaPoints, setMetaPoints] = useState<MetaPoints>({});
  const points = useMemo(() => Object.values(metaPoints), [metaPoints]);
  const metaUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaUi)!;
  const dispatch = useDispatch();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-metas' && msg.levelUid === levelUid) {
        const metaPoints = msg.metas.map(p => LevelMeta.fromJson(p))
          .reduce<MetaPoints>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
        setMetaPoints(metaPoints);
        console.log({ metaPoints });
        dispatch(Act.syncMetaUi(levelUid, Object.values(metaPoints)));
      }
    });
    worker.postMessage({ key: 'request-level-metas', levelUid });
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
              }));
            }}
            /**
             * TODO permit dragging...
             */
            // onMouseDown={() => {
            //   mouseDownAt.current = key;
            // }}
            // onMouseUp={() => {
            //   mouseDownAt.current = undefined;
            // }}
            // onMouseMove={() => {
            //   if (mouseDownAt.current) {
            //     dispatch(Thunk.moveMetaToMouse({ uid: levelUid, metaKey: key }));
            //   }
            // }}
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
                left: metaUi[key].dialogPosition.x,
                top: metaUi[key].dialogPosition.y,
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

export default LevelMetas;
