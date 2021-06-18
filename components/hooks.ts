import { useBeforeunload } from "react-beforeunload";
import { useCallback, useEffect } from 'react';
import useStage from "store/stage.store";
import useCode from "store/code.store";

/**
 * TODO lazy rehydration on component 1st visible to user 
 */
export function usePage({ views, codes }: PageConfig) {

  useEffect(() => {
    useStage.api.rehydrate(views);
    useCode.api.rehydrate(codes);
  }, []);

  const persistOnUnload = useCallback(() => {
    const viewKeys = views.map(x => x.viewKey).filter(x => useStage.api.getView(x));
    const stageKeys = views.map(x => x.stageKey).filter(x => useStage.api.getStage(x));

    viewKeys.forEach((x) => useStage.api.persistView(x));
    stageKeys.forEach((x) => useStage.api.persistStage(x));
    codes.forEach(x => useCode.api.getCode(x) && useCode.api.persist(x));
  }, []);
  useBeforeunload(persistOnUnload);

}

export interface PageConfig {
  views: {
    stageKey: string;
    /** Must be unique e.g. `va:test@intro` */
    viewKey: string;
  }[];
  codes: string[];
}
