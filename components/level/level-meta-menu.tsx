import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { LevelMetaGroup } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Thunk, Act } from '@store/level.duck';
import { LevelState } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';
import css from './level.scss';

type MetaLookup = LevelState['metaGroups'];

const LevelMetaMenu: React.FC<Props> = ({ levelUid }) => {
  const rootEl = useRef<HTMLDivElement>(null);
  const inputEl = useRef<HTMLInputElement>(null);

  const [toGroup, setGroups] = useState<MetaLookup>({});
  const mode = useSelector(({ level: { instance } }) => instance[levelUid].mode);
  const toGroupUi = useSelector(({ level: { instance } }) => instance[levelUid].metaGroupUi);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const dispatch = useDispatch();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if (msg.key === 'send-level-metas' && msg.levelUid === levelUid) {
        const metas = msg.metas.map(p => LevelMetaGroup.from(p))
          .reduce<MetaLookup>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
        // metaGroupUi are synced with LevelMetaGroups in LevelMetas
        setGroups(metas);
      }
    });
    worker.postMessage({ key: 'request-level-metas', levelUid });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (inputEl.current) {
      const found = Object.values(toGroupUi).find(({ over, open }) => over && open);
      found ? inputEl.current?.focus() : focusLevelKeys();
    }
  }, [toGroupUi]);

  /** Open meta group, if any. */
  const open = Object.values(toGroup).find(({ key }) => toGroupUi[key]?.open) || null;

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

  const closeMenu = () => dispatch(Thunk.closeMetaMenu({levelUid}));

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
        style={open ? undefined : { height: 0, padding: 0 }}
      >
        <section className={css.mainMenu}>
          {open && (
            <section key={open.key} className={css.metaGroup}>
              {mode === 'edit' && (
                <input
                  ref={inputEl}
                  placeholder={`tags ${open.metaIndex +  1}/${open.metas.length}`}
                  onKeyPress={({ key: inputKey, currentTarget, currentTarget: { value } }) =>
                    inputKey === 'Enter' && addTag(open.key, open.metas[open.metaIndex].key, value) && (currentTarget.value = '')}
                  onKeyDown={({ key: inputKey }) =>
                    inputKey === 'Escape' && closeMetaGroup(open.key)}
                  onKeyUp={(e) => {
                    e.stopPropagation();
                    e.key === 'ArrowDown' && ensureMeta(open.key, +1);
                    e.key === 'ArrowUp' && ensureMeta(open.key, -1);
                  }}
                />
              )}
              {
                open.metas.filter((_, i) => i === open.metaIndex).map(({ key, tags }) => (
                  <section key="unique" className={css.tags}>
                    {tags.map((tag) =>
                      <div
                        key={tag}
                        className={classNames(css.tag, mode === 'live' && css.live)}
                        onClick={() => mode === 'edit' && removeTag(open.key, key, tag)}
                        title={tag}
                      >
                        {tag}
                      </div>
                    )}
                  </section>
                ))
              }
            </section>
          )}
        </section>
        <section className={css.rightMenu}>
          <button onClick={closeMenu}>
            hide
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
