import { useQuery } from 'react-query';
import { Subject } from 'rxjs';
import { getCached } from '../service/query-client';

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
 * @param {string} stageKey
 * @returns {NPC.Stage | undefined}
 */
export function getCachedStage(stageKey) {
  return getCached(stageKey);
}
