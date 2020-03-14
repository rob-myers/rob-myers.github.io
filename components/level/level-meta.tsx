import { useSelector } from 'react-redux';
import { useMemo } from 'react';
// import { LevelPoint } from '@model/level/level.model';
import css from './level.scss';

const LevelMeta: React.FC<Props> = ({ levelUid }) => {
  // const worker = useSelector(({ level: { worker } }) => worker)!;
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const metaPoints = useMemo(() =>
    Object.values(state.metaPoints), [state.metaPoints]);

  return (
    <>
      {
        metaPoints.map(({ key,  }) => (
          <div
            key={key}
            className={css.metaPointsPopover}
          >
            {key}
          </div>
        ))
      }
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMeta;