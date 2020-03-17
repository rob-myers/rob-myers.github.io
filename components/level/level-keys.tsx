import { useDispatch, useSelector } from 'react-redux';
import { Act } from '@store/level.duck';
import css from './level.scss';

const LevelKeys: React.FC<Props> = ({ levelUid, children}) => {
  const mode = useSelector(({ level: { instance } }) => instance[levelUid].mode);
  const dispatch = useDispatch();

  return (
    <div
      className={css.keys}
      onKeyUp={(e) => {
        // console.log({ key: e.key, state });
        switch (e.key) {
          case '1': return mode === 'edit' && dispatch(Act.updateLevel(levelUid, {
            cursorType: 'default',
          }));
          case '3': return mode === 'edit' && dispatch(Act.updateLevel(levelUid, {
            cursorType: 'refined',
          }));
        }
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

interface Props {
  levelUid: string;
}

export default LevelKeys;
