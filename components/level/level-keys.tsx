import { useDispatch, useSelector } from 'react-redux';
import { Act } from '@store/level.duck';
import css from './level.scss';

const LevelKeys: React.FC<Props> = ({ levelUid, children}) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const dispatch = useDispatch();

  return (
    <div
      className={css.keys}
      onKeyUp={(e) => {
        // console.log({ key: e.key, state });
        if (!state) return;
  
        switch (e.key) {
          case '0': return dispatch(Act.updateLevel(levelUid, {
            cursorType: 'default',
          }));
          case '1': return dispatch(Act.updateLevel(levelUid, {
            cursorType: state.cursorType === 'default' ? 'small' : 'default',
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
