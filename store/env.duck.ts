import * as Redux from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { EnvState, createEnvState } from '@model/env/env.model';

export interface State {
  instance: KeyedLookup<EnvState>;
}

const createInitialState = (): State => ({
  instance: {},
});

export const Act = {
  addEnv: (envKey: string) =>
    Redux.createAct('[env] add env', { envKey }),
  updateEnv: (envKey: string, updates: Redux.ReduxUpdater<EnvState>) =>
    Redux.createAct('[env] update env', { envKey, updates }),
  removeEnv: (envKey: string) =>
    Redux.createAct('[env] remove env', { envKey }),
};

export type Action = Redux.ActionsUnion<typeof Act>;

export const Thunk = {
  getEnv: Redux.createThunk(
    '[Level] get level',
    ({ state: { env: { instance } } }, input: { envKey: string }) =>
      instance[input.envKey] || null, 
  ),
};

export type Thunk = Redux.ActionsUnion<typeof Thunk>;

export const reducer = (state = createInitialState(), act: Action): State => {
  switch (act.type) {
    case '[env] add env': return { ...state,
      instance: Redux.addToLookup(createEnvState(act.pay.envKey), state.instance),
    };
    case '[env] update env': return { ...state,
      instance: Redux.updateLookup(act.pay.envKey, state.instance, act.pay.updates),
    };
    case '[env] remove env': return { ...state,
      instance: Redux.removeFromLookup(act.pay.envKey, state.instance),
    };
    default: return state || testNever(act);
  }
};