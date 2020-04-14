import { KeyedLookup } from '@model/generic.model';
import { NavPath } from '@model/level/nav/nav-path.model';

export interface LevelAuxState {
  /** Aligned to `LevelState` */
  key: string;
  /** Navigation paths by key */
  navPath: KeyedLookup<NavPath>;
}

export function createLevelAuxState(uid: string): LevelAuxState {
  return {
    key: uid,
    navPath: {},
  };
}
