import { useBeforeunload } from "react-beforeunload";
import { useCallback, useEffect } from 'react';
import { getWindow } from "model/dom.model";
import useStage from "store/stage.store";
import useCode from "store/code.store";

export function usePage({
  stageKeys,
  codeKeys,
}: PageConfig) {

  useEffect(() => {
    if (getWindow()) {
      useStage.api.rehydrate(stageKeys);
      useCode.api.rehydrate(codeKeys);
    }
  }, []);

  const persistOnUnload = useCallback(() => {
    stageKeys.forEach(x => useStage.api.getStage(x) && useStage.api.persist(x));
    codeKeys.forEach(x => useCode.api.getCode(x) && useCode.api.persist(x));
  }, []);
  useBeforeunload(persistOnUnload);

}

export interface PageConfig {
  stageKeys: string[];
  codeKeys: string[];
}
