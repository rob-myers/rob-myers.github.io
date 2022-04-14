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
      event: new Subject,
      npc: {},
      cleanups: [],
    };
    setupStage(stage);
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

/**
 * @param {NPC.Stage} stage
 */
function setupStage(stage) {
  const sub = stage.event.subscribe((e) => {
    if (e.key === 'spawn') {
      stage.npc[e.npcKey] = { key: e.npcKey, position: e.at };
      stage.event.next({ ...e, key: 'spawned' });
    }
  });
  stage.cleanups.push(
    () => sub.unsubscribe(),
  );
}
