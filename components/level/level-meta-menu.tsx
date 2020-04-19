import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LevelMetaGroup } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Thunk, Act } from '@store/level.duck';
import css from './level.scss';
import { LevelState } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';

type MetaLookup = LevelState['metaGroups'];

const LevelMetaMenu: React.FC<Props> = ({ levelUid }) => {
  const rootEl = useRef<HTMLDivElement>(null);
  const toInputEl = useRef({} as { [key: string]: HTMLElement });

  const [toGroup, setGroups] = useState<MetaLookup>({});
  const toGroupUi = useSelector(({ level: { instance } }) => instance[levelUid].metaGroupUi);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const dispatch = useDispatch();

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

  useEffect(() => {
    /**
     * TODO focus last changed...
     */
    // const found = Object.values(toGroupUi).find(x => x.justChanged);
    // found && toInputEl.current[found.key]?.focus();
  }, [toGroupUi]);

  const openMetas = Object.values(toGroupUi)
    .filter(x => x.open).map(({ key }) => toGroup[key]).filter(Boolean);

  const addTag = (metaGroupKey: string, metaKey: string, tag: string) => {
    if (/^[a-z0-9][a-z0-9-]*$/.test(tag)) {
      /**
       * Standard tags are non-empty and use lowercase letters, digits and hyphens.
       * Finally, they cannot start with a hyphen.
       */
      worker.postMessage({
        key: 'update-level-meta',
        levelUid,
        metaGroupKey,
        update: { key: 'add-tag', tag, metaKey },
      });
      return true;
    } else if (tag === '-') {
      // Remove a single meta, possibly entire group
      worker.postMessage({ key: 'remove-level-meta', levelUid, metaGroupKey, metaKey });
      toGroup[metaGroupKey].metas.length === 1 && focusLevelKeys();
      return true;
    } else if (tag === '--') {
      // Remove an entire group
      worker.postMessage({ key: 'remove-level-meta', levelUid, metaGroupKey, metaKey: null });
      focusLevelKeys();
    } else if (/^>[a-z0-9][a-z0-9-]*$/.test(tag)) {
      // Given tag '>foo' draw NavPath to 1st meta with tag 'foo'
      const { position } = toGroup[metaGroupKey];
      const dstMeta = Object.values(toGroup)
        .find(({ metas }) => metas.some(meta => meta.tags.includes(tag.slice(1))));
      
      if (dstMeta) {
        worker.postMessage({ key: 'request-nav-path', levelUid,
          navPathUid: `${metaKey}>${dstMeta.key}`,
          src: position.json,
          dst: dstMeta.position.json,
        });
        return true;
      }
    }
  };

  const closeMenu = () => dispatch(Thunk.closeAllMetas({levelUid}));

  const closeMetaGroup = (metaGroupKey: string) => {
    dispatch(Act.updateMetaUi(levelUid, metaGroupKey, { open: false }));
    focusLevelKeys();
  };

  const ensureMeta = (metaGroupKey: string, delta: -1 | 1) => {
    const group = toGroup[metaGroupKey];
    const metaIndex = delta === 1 ? group.metaIndex + 1 : posModulo(group.metaIndex - 1, group.metas.length);
    worker.postMessage({ key: 'update-level-meta', levelUid, metaGroupKey, update: { key: 'ensure-meta-index', metaIndex }});
  };

  function focusLevelKeys() {
    rootEl.current?.parentElement?.focus();
  }

  const removeTag = (metaGroupKey: string, metaKey: string, tag: string) => {
    worker.postMessage({ key: 'update-level-meta', levelUid, metaGroupKey, update: { key: 'remove-tag', tag, metaKey }});
  };

  return (
    <div
      className={css.metaMenuContainer}
      ref={rootEl}
    >
      <div
        className={css.metaMenu}
        style={!openMetas.length ? { height: 0 } : undefined}
      >
        <section className={css.mainMenu}>
          {openMetas.map(({ key: groupKey, metas, metaIndex }) => (
            <section key={groupKey} className={css.metaGroup}>
              <input
                ref={(el) =>
                  el ? (toInputEl.current[groupKey] = el) : (delete toInputEl.current[groupKey])
                }
                placeholder={`tags ${metaIndex +  1}/${metas.length}`}
                onKeyPress={({ key: inputKey, currentTarget, currentTarget: { value } }) =>
                  inputKey === 'Enter' && addTag(groupKey, metas[metaIndex].key, value) && (currentTarget.value = '')}
                onKeyDown={({ key: inputKey }) =>
                  inputKey === 'Escape' && closeMetaGroup(groupKey)}
                onKeyUp={(e) => {
                  e.stopPropagation();
                  e.key === 'ArrowDown' && ensureMeta(groupKey, +1);
                  e.key === 'ArrowUp' && ensureMeta(groupKey, -1);
                }}
              />
              {
                metas.filter((_, i) => i === metaIndex).map(({ key, tags }) => (
                  <section key="unique" className={css.tags}>
                    {tags.map((tag) =>
                      <div
                        key={tag}
                        className={css.tag}
                        onClick={() => removeTag(groupKey, key, tag)}
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
