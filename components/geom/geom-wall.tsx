import css from './geom.scss';

/** All walls have same height */
const Wall: React.FC<Props> = ({ x, y, dx, dy }) => {
  return (
    <rect
      className={css.wall}
      x={x} y={y} width={dx} height={dy}
    />
  );
};

interface Props {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export default Wall;
