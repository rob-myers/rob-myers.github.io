import { useBeforeunload } from "react-beforeunload";
import { useCallback, useEffect } from 'react';
import useStage from "store/stage.store";

export function usePage({ stageKeys }: {stageKeys: string[]}) {
  const autoPersist = useStage(({ persistOnUnload }) => persistOnUnload);

  useEffect(() => {
    useStage.api.rehydrate(stageKeys);
  }, []);

  const persistOnUnload = useCallback(() => {
    autoPersist && stageKeys.forEach(x =>
      useStage.api.getStage(x) && useStage.api.persist(x));
  }, [autoPersist]);

  useBeforeunload(persistOnUnload);

}

export type PageConfig = Parameters<typeof usePage>[0];
