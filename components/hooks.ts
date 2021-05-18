import { useBeforeunload } from "react-beforeunload";
import { useCallback, useEffect } from 'react';
import useStage from "store/stage.store";

export function usePage({ stageKeys }: {stageKeys: string[]}) {
  useEffect(() => {
    useStage.api.rehydrate(stageKeys);
  }, []);

  const persistOnUnload = useCallback(() => {
    stageKeys.forEach(x => useStage.api.getStage(x) && useStage.api.persist(x));
  }, []);
  useBeforeunload(persistOnUnload);

}

export type PageConfig = Parameters<typeof usePage>[0];
