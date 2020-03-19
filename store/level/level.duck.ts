import { KeyedLookup, testNever } from '@model/generic.model';
import { LevelState, createLevelState } from '@model/level/level.model';
import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup } from '@model/redux.model';
import { LevelAuxState, createLevelAuxState } from '@model/level/level-aux.model';

/**
 * This state lives inside the level worker.
 */
export interface State {
  instance: KeyedLookup<LevelState>;
  /** Ephemeral state associated with `LevelState` */
  aux: KeyedLookup<LevelAuxState>;
}

const initialState: State = {
  instance: {},
  aux: {},
};

export const Act = {
  registerLevel: (uid: string) =>
    createAct('[Level] register', { uid }),
  unregisterLevel: (uid: string) =>
    createAct('[Level] unregister', { uid }),
  updateLevel: (uid: string, updates: Partial<LevelState>) =>
    createAct('[Level] update', { uid, updates }),
  updateLevelAux: (uid: string, updates: Partial<LevelAuxState>) =>
    createAct('[Level] aux update', { uid, updates }),
  clearLevelAux: (uid: string) =>
    createAct('[Level] clear aux', { uid }),
};

export type Action = ActionsUnion<typeof Act>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[Level] register': return { ...state,
      instance: addToLookup(createLevelState(act.pay.uid), state.instance),
      aux: addToLookup(createLevelAuxState(act.pay.uid), state.aux),
    };
    case '[Level] unregister': return { ...state,
      instance: removeFromLookup(act.pay.uid, state.instance),
      aux: removeFromLookup(act.pay.uid, state.aux),
    };
    case '[Level] update': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, () => act.pay.updates),
    };
    case '[Level] aux update': return { ...state,
      aux: updateLookup(act.pay.uid, state.aux, () => act.pay.updates),
    };
    case '[Level] clear aux': return { ...state,
      aux: updateLookup(act.pay.uid, state.aux, () => ({
        navPath: {},
      })),
    };
    default: return state || testNever(act);
  }
};
