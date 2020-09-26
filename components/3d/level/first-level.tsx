import { Closet, Corner, Fourway, Junction, Straight } from '../room';
import Level from './level';
import Inner from '../room/inner';

const FirstLevel: React.FC<Props> = ({ envName }) => (
  <Level envName={envName}>
    <Closet x={-4}>
      <Inner id="sideboard" />  
    </Closet>
    <Junction>
      <Inner id="central-table" y={0} />  
    </Junction>
    <Closet x={4} w>
      <Inner id="sideboard" />  
    </Closet>
    
    <Fourway y={-4} />
    <Corner x={-4} y={-4} n />
    <Straight x={4} y={-4} />
    {/* <Closet x={8} y={-4} w /> */}
    
    <Closet x={-4} y={-8} n />
    <Straight y={-8} s />
  </Level>
);

interface Props {
  envName: string;
}

export default FirstLevel;
