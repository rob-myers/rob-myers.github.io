import { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { KeyedLookup } from '@model/generic.model';
import { LevelPoint } from '@model/level/level-point.model';
import css from './level.scss';

const LevelMeta: React.FC<Props> = ({ levelUid, metaPoints, viewportRef }) => {
  const points = useMemo(() => Object.values(metaPoints), [metaPoints]);
  // const [state, localDispatch] = useReducer();

  return (
    <>
      <g className={css.levelPoints}>
        {points.map(({ position, key }) =>
          <circle
            key={key}
            cx={position.x}
            cy={position.y}
            r={1}
            onClick={() => {
              console.log('CLICK');
            }}
          />
        )}
      </g>
      {// Popovers
        viewportRef.current && ReactDOM.createPortal(
          points.map(({ key }) => (
            <div
              key={key}
              className={css.metaPointsPopover}
            >
              {key}
            </div>
          ))
          , viewportRef.current)
      }
    </>
  );
};


interface Props {
  levelUid: string;
  viewportRef: React.RefObject<HTMLElement>;
  metaPoints: KeyedLookup<LevelPoint>;
}

export default LevelMeta;