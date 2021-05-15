import styled from "@emotion/styled";

import useStage from "store/stage.store";
import Stage from './Stage';

// TODO handle 'one instance at a time'

const WrappedStage: React.FC<Props> = ({ stageKey }) => {
  const stage = useStage(({ stage }) => stageKey in stage ? stage[stageKey] : null);

  return <Root>{stage ? <Stage stage={stage} /> : null}</Root>;
};

interface Props {
  stageKey: string;
}

const Root = styled.section`
  grid-area: stage;
  width: 100%;
  height: 100%;
`;

export default WrappedStage;
