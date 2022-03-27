import { useQuery } from 'react-query';
import { Subject } from 'rxjs';
import { queryCache } from 'store/query-client';

/**
 * Ensure stage `stageKey` (default `stage-default`)
 * @param {string} [stageKey] 
 */
export default function useStage(stageKey = 'stage-default') {
  return useQuery(stageKey, () => {
    /** @type {NPC.Stage} */
    const stage = {
      key: stageKey,
      keyEvent: new Subject,
      ptrEvent: new Subject,
    };
    return stage;
  }, {
    keepPreviousData: true,
    staleTime: Infinity,
  });
}

/**
 * @param {string} queryKey
 * @returns {any | undefined}
 */
export function getCachedItem(queryKey) {
  return queryCache.find(queryKey)?.state.data;
}
