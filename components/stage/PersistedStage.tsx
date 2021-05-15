import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";
import { useBeforeunload } from "react-beforeunload";

import useStage from "store/stage.store";
import Stage from './Stage';

const PersistedStage: React.FC<Props> = ({ stageKey }) => {
  const rehydrated = useStage(({ rehydrated }) => rehydrated);
  const stage = useStage(({ stage }) => stageKey in stage ? stage[stageKey] : null);

  useEffect(() => {
    rehydrated && useStage.api.ensureStage(stageKey);
  }, [rehydrated, stageKey]);

  const persistOnUnload = useCallback(() =>
    stage?.opt.autoPersist && useStage.api.persist(stageKey),
    [stage?.opt.autoPersist, stageKey],
  );
  useBeforeunload(persistOnUnload);

  return (
    <Root>
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

export default PersistedStage;
