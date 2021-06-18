import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import styled from "@emotion/styled";

import useStage from "store/stage.store";
import Stage from './Stage';

export default function WrappedStage({ stageKey }: Props) {
  const stage = useStage(({ stage }) => stageKey in stage ? stage[stageKey] : null);
  const { ref, inView } = useInView({ /** rootMargin: '200px' */ });

  useEffect(() => {
    stage && !inView && useStage.api.updateOpt(stage.key, { enabled: false });
  }, [inView, stageKey]);

  return (
    <Root ref={ref}>
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
