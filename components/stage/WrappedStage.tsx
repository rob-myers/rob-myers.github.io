import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import styled from "@emotion/styled";

import useStage from "store/stage.store";
import Stage from './Stage';

export default function WrappedStage({ stageKey, viewKey, gridArea }: Props) {
  const stage = useStage(({ stage }) => stageKey in stage ? stage[stageKey] : null);
  const view = useStage(({ view }) => viewKey in view ? view[viewKey] : null);

  const { ref, inView } = useInView({ /** rootMargin: '200px' */ });
  useEffect(() => {
    view && !inView && useStage.api.updateOpt(view.key, { enabled: false });
  }, [inView]);

  return (
    <Root ref={ref} gridArea={gridArea}>
      {stage && view ? <Stage stage={stage} view={view} /> : null}
    </Root>
  );
};

interface Props {
  viewKey: string;
  stageKey: string;
  gridArea?: string;
}

const Root = styled.section<{ gridArea?: string }>`
  grid-area: ${props => props.gridArea || ''};
  width: 100%;
  height: 100%;
`;
