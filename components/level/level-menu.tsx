import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { Act } from '@store/level.duck';
import { subscribeToWorker } from '@model/level/level.worker.model';
import css from './level.scss';


const LevelMenu: React.FC<Props> = ({ levelUid }) => {
  const worker = useSelector(({ level: { worker } }) => worker);
  const cursorType = useSelector(({ level: { instance } }) => instance[levelUid].cursorType);
  const mode = useSelector(({ level: { instance } }) => instance[levelUid].mode);
  const theme = useSelector(({ level: { instance } }) => instance[levelUid].theme);
  const showNavGraph = useSelector(({ level: { instance } }) => instance[levelUid].showNavGraph);
  const notifyForwarder = useSelector(({ level: { instance } }) => instance[levelUid].notifyForwarder);
  const dispatch = useDispatch();
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    const sub = subscribeToWorker(worker!, (msg) => {
      if ('levelUid' in msg && msg.levelUid !== levelUid) return;
      if (showNavGraph && msg.key === 'send-level-tris') {
        // Showing visualisation of NavGraph, so request it whenever nav tris update
        worker?.postMessage({ key: 'request-nav-view', levelUid });
      }
      if (msg.key === 'floyd-warshall-ready') {
        msg.changed && notifyForwarder?.next({ key: 'floyd-warshall-ready', orig: msg });
        setCanSave(true);
      }
    });
    return () => sub.unsubscribe();
  }, [showNavGraph, notifyForwarder]);

  const save = async () => {
    setCanSave(false);
    worker!.postMessage({ key: 'ensure-floyd-warshall', levelUid });
  };

  const toggleNavView = () => {
    !showNavGraph && worker?.postMessage({ key: 'request-nav-view', levelUid });
    dispatch(Act.updateLevel(levelUid, { showNavGraph: !showNavGraph }));
  };

  return (
    <section className={css.menu}>
      {
        mode === 'edit' && (
          <>
            <section className={css.editMenu}>
              <input
                className={css.filenameInput}
                title="filename"
                disabled
                placeholder={levelUid}
              />
              <button
                className={css.button}
                onClick={() => canSave && save()}
              >
                  save
              </button>
            </section>

            <section className={css.mainMenu}>
              <button
                className={css.button}
                onClick={(_e) => dispatch(Act.updateLevel(levelUid, {
                  theme: theme === 'dark-mode' ? 'light-mode' : 'dark-mode',
                }))}
              >
                {theme === 'dark-mode' ? 'dark' : 'plan'}
              </button>
              <button
                className={css.button}
                onClick={toggleNavView}
              >
                nav
              </button>
              <button
                title="grid size"
                className={classNames(css.button, {
                  [css.pressed]: cursorType === 'refined'
                })}
                onClick={(_e) => dispatch(Act.updateLevel(levelUid, {
                  cursorType: cursorType === 'refined' ? 'default' : 'refined',
                }))}
              >
                  ×{cursorType === 'refined' ? 3 : 1}
              </button>
            </section>
          </>
        )
      }
    </section>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMenu;