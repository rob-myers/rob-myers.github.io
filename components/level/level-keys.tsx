import { useDispatch, useSelector } from 'react-redux';

import { Act, Thunk } from '@store/level.duck';
import css from './level.scss';

const LevelKeys: React.FC<Props> = ({ levelUid, children}) => {
  const mode = useSelector(({ level: { instance } }) => instance[levelUid].mode);
  const dispatch = useDispatch();

  return (
    <div
      className={css.keys}
      onKeyUp={(e) => {
        // console.log({ key: e.key, state });
        const state = dispatch(Thunk.getLevel({ levelUid }));

        switch (e.key) {
          case '1': return mode === 'edit' && dispatch(Act.updateLevel(levelUid, {
            cursorType: 'default',
          }));
          case '2': return mode === 'edit' && dispatch(Act.updateLevel(levelUid, {
            cursorType: 'refined',
          }));
          case '3': return mode === 'edit' && dispatch(Act.updateLevel(levelUid, {
            showThreeD: !state.showThreeD,
          }));
          case '4': return mode === 'edit' && dispatch(Act.updateLevel(levelUid, {
            theme: state.theme === 'dark-mode' ? 'light-mode' : 'dark-mode',
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
