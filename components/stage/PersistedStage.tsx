import { useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { useBeforeunload } from "react-beforeunload";
import useStage from "store/stage.store";
import Stage from './Stage';

const PersistedStage: React.FC<Props> = ({ stageKey }) => {
  const rehydrated = useStage(({ rehydrated }) => rehydrated);
  const stage = useStage(({ stage }) =>
    stageKey in stage ? stage[stageKey] : null
  );

  useEffect(() => {
    if (rehydrated) {
      useStage.api.ensureStage(stageKey);
    }
  }, [rehydrated, stageKey]);

  const persistOnUnload = useCallback(() =>
    stage?.opt.autoPersist && useStage.api.persist(stageKey),
    [stage?.opt.autoPersist, stageKey],
  );
  useBeforeunload(persistOnUnload);

  return (
    <WrapperRoot>
      {stage ? <Stage stage={stage} /> : null}
    </WrapperRoot>
  )
};

const WrapperRoot = styled.section`
  grid-area: stage;
  width: 100%;
  height: 100%;
`;

interface Props {
  stageKey: string;
}

export default PersistedStage;
