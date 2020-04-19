import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { LevelMetaGroup } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Thunk, Act } from '@store/level.duck';
import css from './level.scss';
import { LevelState } from '@model/level/level.model';

type MetaLookup = LevelState['metaGroups'];

const LevelMetaMenu: React.FC<Props> = ({ levelUid }) => {
  const [openMetas, setOpenMetas] = useState<LevelMetaGroup[]>([]);
  const [toGroup, setGroups] = useState<MetaLookup>({});

  const metaGroupUi = useSelector(({ level: { instance } }) => instance[levelUid].metaGroupUi);
  const worker = useSelector(({ level: { worker } }) => worker)!;

  const dispatch = useDispatch();
  const closeMenu = () => dispatch(Thunk.closeAllMetas({levelUid}));

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-metas' && msg.levelUid === levelUid) {
        const metas = msg.metas.map(p => LevelMetaGroup.from(p))
          .reduce<MetaLookup>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
        setGroups(metas);
        dispatch(Act.syncMetaUi(levelUid, Object.values(metas)));
      }
    });
    worker.postMessage({ key: 'request-level-metas', levelUid });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const openUis = Object.values(metaGroupUi).filter(({ open }) => open);
    const openMetas = openUis.map(({ key }) => toGroup[key]).filter(Boolean);
    // setOpenUis(openUis);
    setOpenMetas(openMetas);
  }, [metaGroupUi]);

  return (
    <div className={css.metaMenuContainer}>
      <div
        className={classNames(css.metaMenu)}
        style={{ height: openMetas.length * 20 }}
      >
        <section className={css.mainMenu}>
          {openMetas.map(({ key, metas, metaIndex }) => (
            <section key={key} className={css.meta}>
              {
                metas.filter((_, i) => i === metaIndex).map(meta => meta.tags)
              }
            </section>
          ))}
        </section>
        <section className={css.rightMenu}>
          <button onClick={closeMenu}>
          close
          </button>
        </section>
      </div>
    </div>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMetaMenu;
