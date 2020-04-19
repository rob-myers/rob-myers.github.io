import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Act } from '@store/level.duck';
import css from './level.scss';

const LevelMenu: React.FC<Props> = ({ levelUid }) => {
  const worker = useSelector(({ level: { worker } }) => worker);
  const notifyForwarder = useSelector(({ level: { instance } }) => instance[levelUid].notifyForwarder);
  
  const mode = useSelector(({ level: { instance } }) => instance[levelUid].mode);
  const theme = useSelector(({ level: { instance } }) => instance[levelUid].theme);
  const showNavRects = useSelector(({ level: { instance } }) => instance[levelUid].showNavRects);
  const showNavTris = useSelector(({ level: { instance } }) => instance[levelUid].showNavTris);
  const showThreeD = useSelector(({ level: { instance } }) => instance[levelUid].showThreeD);
  
  const dispatch = useDispatch();
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    const sub = subscribeToWorker(worker!, (msg) => {
      if (msg.key === 'floyd-warshall-ready' && msg.levelUid === levelUid) {
        msg.changed && notifyForwarder?.next({ key: 'floyd-warshall-ready', orig: msg });
        setCanSave(true);
      }
    });
    return () => sub.unsubscribe();
  }, [notifyForwarder]);

  const save = async () => {
    setCanSave(false);
    worker!.postMessage({ key: 'ensure-floyd-warshall', levelUid });
  };

  const toggleMode = () => {
    dispatch(Act.updateLevel(levelUid, { mode: mode === 'edit' ? 'live' : 'edit' }));
  };

  const toggleTheme = () => dispatch(Act.updateLevel(levelUid, {
    theme: theme === 'dark-mode' ? 'light-mode' : 'dark-mode',
  }));

  const toggle3dView = () => {
    dispatch(Act.updateLevel(levelUid, { showThreeD: !showThreeD }));
  };

  const toggleNavRects = () => {
    !showNavRects && worker?.postMessage({ key: 'request-nav-rects', levelUid });
    dispatch(Act.updateLevel(levelUid, { showNavRects: !showNavRects }));
  };

  const toggleNavTris = () => {
    dispatch(Act.updateLevel(levelUid, { showNavTris: !showNavTris }));
  };

  return (
    <section className={css.menu}>
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
          className={classNames(css.button)}
          onClick={toggleMode}
        >
          @{mode}
        </button>
        <button
          className={classNames(css.button, theme === 'dark-mode' && css.enabled)}
          onClick={toggleTheme}
        >
          dark
        </button>
        <button
          className={classNames(css.button, showThreeD && css.enabled)}
          onClick={toggle3dView}
        >
          3d
        </button>
        <button
          className={classNames(css.button, showNavRects && css.enabled)}
          onClick={toggleNavRects}
        >
          rect
        </button>
        <button
          className={classNames(css.button, showNavRects && css.enabled)}
          onClick={toggleNavTris}
        >
          tris
        </button>
      </section>
    </section>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMenu;