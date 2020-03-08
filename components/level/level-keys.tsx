import css from './level.scss';

const LevelKeys: React.FC<Props> = ({
  // levelUid,
  width,
  height
}) => {
  return (
    <rect
      className={css.mouseRect}
      style={{ width, height }}
    />
  );
};

interface Props {
  levelUid: string;
  width: number;
  height: number;
}

export default LevelKeys;
