import { range } from '@model/generic.model';
import css from './level.scss';


const LevelOverlay: React.FC<Props> = ({ width, height, tileDim: td}) => {
  return (
    <>
      {range(Math.ceil( width / td )).map(x => x * td).map((x, i) =>
        <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={height} className={css.gridLine} /> )}
      {range(Math.ceil( height / td )).map(x => x * td).map((y, i) =>
        <line key={`h-${i}`} x1={0} y1={y} x2={width} y2={y} className={css.gridLine} /> )}
    </>
  );
};

interface Props {
  tileDim: number;
  width: number;
  height: number;
}

export default LevelOverlay;
