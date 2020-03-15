import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import css from './level.scss';
import { Act } from '@store/level.duck';

const LevelMenu: React.FC<Props> = ({ levelUid }) => {
  const cursorType = useSelector(({ level: { instance } }) => instance[levelUid]?.cursorType);
  const editMode = useSelector(({ level: { instance } }) => instance[levelUid]?.editMode);
  const dispatch = useDispatch();

  return (
    <section className={css.menu}>
      {
        editMode && (
          <>
            <section className={css.editMenu}>
              <button
                className={classNames(css.button, {
                  [css.pressed]: cursorType === 'refined'
                })}
                onClick={(_e) => dispatch(Act.updateLevel(levelUid, {
                  cursorType: cursorType === 'refined' ? 'default' : 'refined',
                }))}
              >
                inner
              </button>
              <input
                className={css.filenameInput}
                placeholder="filename"
              />
            </section>
            <section className={css.mainMenu}>
              <button
                className={css.button}
                onClick={(_e) => dispatch(Act.updateLevel(levelUid, {
                  editMode: editMode === 'make' ? 'meta' : 'make',
                }))}
              >
                {editMode}
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