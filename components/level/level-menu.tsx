import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import css from './level.scss';
import { Act } from '@store/level.duck';

const LevelMenu: React.FC<Props> = ({ levelUid }) => {
  const cursorType = useSelector(({ level: { instance } }) => instance[levelUid]?.cursorType);
  const mode = useSelector(({ level: { instance } }) => instance[levelUid]?.mode);
  const dispatch = useDispatch();

  return (
    <section className={css.menu}>
      {
        mode === 'edit' && (
          <>
            <section className={css.editMenu}>
              <input
                title="filename"
                className={css.filenameInput}
                placeholder="filename"
              />
              <button className={css.button}>
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