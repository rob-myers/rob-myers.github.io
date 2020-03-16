import { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { LevelState } from '@model/level/level.model';
import { LevelMeta, metaPointRadius } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Act } from '@store/level.duck';
import css from './level.scss';

type MetaLookup = LevelState['metas'];

const LevelMetas: React.FC<Props> = ({ levelUid, overlayRef }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const [levelMetas, setLevelMetas] = useState<MetaLookup>({});
  const metas = useMemo(() => Object.values(levelMetas), [levelMetas]);
  const metaUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaUi)!;
  const dispatch = useDispatch();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-metas' && msg.levelUid === levelUid) {
        const metas = msg.metas.map(p => LevelMeta.fromJson(p))
          .reduce<MetaLookup>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
        setLevelMetas(metas);
        dispatch(Act.syncMetaUi(levelUid, Object.values(metas)));
      }
    });
    worker.postMessage({ key: 'request-level-metas', levelUid });
    return () => sub.unsubscribe();
  }, []);

  return (
    <>
      <g className={css.levelMetas}>
        {metas.map(({ position, key }) =>
          <circle
            key={key}
            style={metaUi[key] && { 
              fill: metaUi[key].over ? 'red' : 'white' }}
            cx={position.x}
            cy={position.y}
            r={metaPointRadius}
          />
        )}
      </g>
      {// Popovers
        overlayRef.current && ReactDOM.createPortal(
          metas.map(({ key }) => (
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
