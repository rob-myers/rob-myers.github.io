import { KeyedLookup } from '@model/generic.model';
import { LevelState, createLevelState } from '@model/level/level.model';
import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup } from '@model/redux.model';

export interface State {
  instance: KeyedLookup<LevelState>;
  ready: boolean;
}

const initialState: State = {
  instance: {},
  ready: false,
};

export const Act = {
  registerLevel: (uid: string) =>
    createAct('[Level] register', { uid }),
  unregisterLevel: (uid: string) =>
    createAct('[Level] unregister', { uid }),
  updateLevel: (uid: string, updates: Partial<LevelState>) =>
    createAct('[Level] generic update', { uid, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[Level] register': return { ...state,
      instance: addToLookup(createLevelState(act.pay.uid), state.instance),
    };
    case '[Level] unregister': return { ...state,
      instance: removeFromLookup(act.pay.uid, state.instance),
    };
    case '[Level] generic update': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, () => act.pay.updates),
    };
    default: return state;
  }
};
