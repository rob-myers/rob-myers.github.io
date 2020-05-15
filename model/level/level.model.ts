/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
}

export function createLevelState(uid: string): LevelState {
  return {
    key: uid,
  };
}
