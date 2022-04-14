import { useQuery } from 'react-query';
import { Subject } from 'rxjs';
import { getCached } from '../service/query-client';

/**
 * Ensure stage `stageKey` (default `stage-default`).
 * - we ensure it is returned immediately.
 * - useQuery makes the data visible in react-query dev tools
 * @param {string} [stageKey] 
 */
export default function useStage(stageKey = 'stage-default') {
  return /** @type {NPC.Stage} */ (/** @type {*} */ (useQuery(stageKey, () => {
    const stage = ensureStage(stageKey);
    setupStage(stage);
    return stage;
  }, {
    keepPreviousData: true,
    staleTime: Infinity,
    initialData: ensureStage(stageKey),
  }).data));
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

/** @type {Record<string, NPC.Stage>} */
const localStageLookup = {

};

/** @param {string} stageKey */
function ensureStage(stageKey) {
  return localStageLookup[stageKey] || (localStageLookup[stageKey] = {
    key: stageKey,
    event: new Subject,
    npc: {},
    cleanups: [],
  });
}