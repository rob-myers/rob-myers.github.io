import * as Redux from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { EnvState, createEnvState } from '@model/env/env.model';
import { VectorJson } from '@model/geom/geom.model';

export type State = KeyedLookup<EnvState>;

const createInitialState = (): State => ({});

export const Act = {
  addEnv: (envKey: string, dimension: VectorJson) =>
    Redux.createAct('[env] add env', { envKey, dimension }),
  removeEnv: (envKey: string) =>
    Redux.createAct('[env] remove env', { envKey }),
  updateEnv: (envKey: string, updates: Partial<EnvState> | Redux.ReduxUpdater<EnvState>) =>
    Redux.createAct('[env] update env', { envKey, updates }),
};

export type Action = Redux.ActionsUnion<typeof Act>;

export const Thunk = {
  getEnv: Redux.createThunk(
    '[env] get env',
    ({ state: { env } }, input: { envKey: string }) =>
      input.envKey in env ? env[input.envKey] : null, 
  ),
};

export type Thunk = Redux.ActionsUnion<typeof Thunk>;

export const reducer = (state = createInitialState(), act: Action): State => {
  switch (act.type) {
    case '[env] add env':
      return Redux.addToLookup(createEnvState(act.pay.envKey, act.pay.dimension), state);
    case '[env] remove env':
      return Redux.removeFromLookup(act.pay.envKey, state);
    case '[env] update env':
      return Redux.updateLookup(
        act.pay.envKey,
        state,
        typeof act.pay.updates === 'function'
          ? act.pay.updates
          : () => act.pay.updates as Partial<EnvState>,
      );
    default: return state || testNever(act);
  }
};
