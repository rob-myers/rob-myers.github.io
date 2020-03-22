import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useToasts, Options as ToastOptions} from 'react-toast-notifications';

import css from './level.scss';
import { Act } from '@store/level.duck';
import { awaitWorker } from '@model/level/level.worker.model';

const toastOpts = (ms = 3000) => ({
  appearance: 'info',
  autoDismiss: true,
  autoDismissTimeout: ms,
} as ToastOptions);

const LevelMenu: React.FC<Props> = ({ levelUid }) => {
  const cursorType = useSelector(({ level: { instance } }) => instance[levelUid]?.cursorType);
  const worker = useSelector(({ level: { worker } }) => worker);
  const mode = useSelector(({ level: { instance } }) => instance[levelUid]?.mode);
  const theme = useSelector(({ level: { instance } }) => instance[levelUid]?.theme);
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const [canSave, setCanSave] = useState(true);

  // TODO
  const save = async () => {
    setCanSave(false);
    worker!.postMessage({ key: 'compute-floyd-warshall', levelUid });
    const { areaCount, edgeCount, nodeCount } = await awaitWorker('floyd-warshall-ready', worker!);
    addToast((<>
      <div>Computed <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm">Floyd-Warshall algorithm</a></div>
      <div>{nodeCount} nodes, {edgeCount} edges and {areaCount} area{areaCount === 1 ? '' : 's'}.</div>
    </>), toastOpts());
    setCanSave(true);
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