import { useBeforeunload } from "react-beforeunload";
import { useCallback, useEffect } from 'react';
import useStage from "store/stage.store";

export function usePage({ stageKeys }: {stageKeys: string[]}) {
  const rehydrated = useStage(({ rehydrated }) => rehydrated);
  const autoPersist = useStage(({ persistOnUnload }) => persistOnUnload);

  useEffect(() => {
    if (rehydrated) {
      stageKeys.forEach(stageKey => useStage.api.ensureStage(stageKey));
    }
  }, [rehydrated]);

  const persistOnUnload = useCallback(() => {
    if (autoPersist) {
      stageKeys.forEach(stageKey => useStage.api.persist(stageKey));
    }
  }, [autoPersist]);
  useBeforeunload(persistOnUnload);

}

export type PageConfig = Parameters<typeof usePage>[0];
