import css from './env.scss';

const EnvFloor: React.FC<Props> = ({ envKey }) => {
  return (
    <>
      <g className={css.baseFloor}>
      </g>
      <g className={css.navigable}>
      </g>
      <g className={css.wallSeg}>
      </g>
    </>
  );
};

interface Props {
  envKey: string;
}

export default EnvFloor;
