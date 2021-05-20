import { useInView } from "react-intersection-observer";
import styled from "@emotion/styled";

import useStage from "store/stage.store";
import Stage from './Stage';
import { useEffect } from "react";

const WrappedStage: React.FC<Props> = ({ stageKey }) => {
  const stage = useStage(({ stage }) => stageKey in stage ? stage[stageKey] : null);

  const { ref: rootRef, inView } = useInView({
    // rootMargin: '200px',
  });

  useEffect(() => {
    stage && !inView && useStage.api.updateOpt(stage.key, { enabled: false });
  }, [inView, stageKey]);

  return (
    <Root ref={rootRef}>
      {stage ? <Stage stage={stage} /> : null}
    </Root>
  );
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
