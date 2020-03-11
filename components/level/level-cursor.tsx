import { useSelector } from 'react-redux';
import css from './level.scss';

const LevelCursor: React.FC<Props> = ({ levelUid, tileDim }) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);

  return (
    <g style={{ transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)` }}>
      <rect
        className={css.cursor}
        width={tileDim}
        height={tileDim}
      />
    </g>
  );
};

interface Props {
  levelUid: string;
  tileDim: number;
}

export default LevelCursor;
