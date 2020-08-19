import css from './geom.scss';

/** All tables have same height */
const Table: React.FC<Props> = ({ x, y, dx, dy }) => {
  return (
    <rect
      className={css.table}
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

export default Table;
