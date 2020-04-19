import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LevelMetaGroup } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Thunk, Act } from '@store/level.duck';
import css from './level.scss';
import { LevelState } from '@model/level/level.model';

type MetaLookup = LevelState['metaGroups'];

const LevelMetaMenu: React.FC<Props> = ({ levelUid }) => {
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
        dispatch(Act.syncMetaUi(levelUid, Object.values(metas)));
        setGroups(metas);
      }
    });
    worker.postMessage({ key: 'request-level-metas', levelUid });
    return () => sub.unsubscribe();
  }, []);

  const openMetas = Object.values(metaGroupUi)
    .filter(x => x.open).map(({ key }) => toGroup[key]).filter(Boolean);

  return (
    <div className={css.metaMenuContainer}>
      <div className={css.metaMenu}>
        <section className={css.mainMenu}>
          {openMetas.map(({ key: groupKey, metas, metaIndex }) => (
            <section key={groupKey} className={css.metaGroup}>
              <input
                placeholder={`tags ${metaIndex +  1}/${metas.length}`}
              />
              {
                metas.filter((_, i) => i === metaIndex).map(({ tags }) => (
                  <section key="unique" className={css.tags}>
                    {tags.map((tag) =>
                      <div
                        key={tag}
                        className={css.tag}
                        // onClick={() => removeTag(groupKey, key, tag)}
                        title={tag}
                      >
                        {tag}
                      </div>
                    )}
                  </section>
                ))
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
