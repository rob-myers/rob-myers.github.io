import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import css from './level.scss';
import { Act } from '@store/level.duck';

const LevelMenu: React.FC<Props> = ({ levelUid }) => {
  const cursorType = useSelector(({ level: { instance } }) => instance[levelUid]?.cursorType);
  const worker = useSelector(({ level: { worker } }) => worker);
  const mode = useSelector(({ level: { instance } }) => instance[levelUid]?.mode);
  const view = useSelector(({ level: { instance } }) => instance[levelUid]?.view);
  const dispatch = useDispatch();

  const save = () => {
    worker?.postMessage({ key: 'compute-floyd-warshall', levelUid });
    // TODO can save branch
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
                onClick={() => save()}
              >
                save
              </button>
            </section>

            <section className={css.mainMenu}>
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
              <button
                className={css.button}
                onClick={(_e) => dispatch(Act.updateLevel(levelUid, {
                  view: view === 'plan' ? 'dark' : 'plan',
                }))}
              >
                {view}
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