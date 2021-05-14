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

  return stage ? <Stage stage={stage} /> : null;
};

interface Props {
  stageKey: string;
}

export default PersistedStage;
