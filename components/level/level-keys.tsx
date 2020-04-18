import { useDispatch } from 'react-redux';

import { Act, Thunk } from '@store/level.duck';
import css from './level.scss';

const LevelKeys: React.FC<Props> = ({ levelUid, children}) => {
  const dispatch = useDispatch();

  return (
    <div
      className={css.keys}
      onKeyUp={(e) => {
        // console.log({ key: e.key });
        const state = dispatch(Thunk.getLevel({ levelUid }));

        switch (e.key.toLowerCase()) {
          case '1': return dispatch(Act.updateLevel(levelUid, {
            mode: state.mode === 'edit' ? 'live' : 'edit',
          }));
          case '2': return dispatch(Act.updateLevel(levelUid, {
            showThreeD: !state.showThreeD,
          }));
          case '3': return dispatch(Act.updateLevel(levelUid, {
            theme: state.theme === 'dark-mode' ? 'light-mode' : 'dark-mode',
          }));
          case '4': return dispatch(Act.updateLevel(levelUid, {
            showNavRects: !state.showNavRects,
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
