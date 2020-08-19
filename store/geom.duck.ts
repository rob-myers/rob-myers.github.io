import { KeyedLookup, testNever } from '@model/generic.model';
import * as Redux from '@model/store/redux.model';
import { GeomService } from '@model/geom/geom.service';
import * as Geom from '@model/geom/geom.model';
import { GeomRootState, createGeomRoot } from '@model/geom/geom-root.model';

export interface State {
  service: GeomService;
  lookup: KeyedLookup<GeomRootState>;
}

const initialState: State = {
  lookup: {},
  service: new GeomService,
};

export const Act = {
  closeGeom: (geomKey: string) =>
    Redux.createAct('[geom] close geom', { geomKey }),
  openGeom: (geomKey: string) =>
    Redux.createAct('[geom] open geom', { geomKey }),
  updateGeom: (
    geomKey: string,
    updates: Partial<GeomRootState> | Redux.ReduxUpdater<GeomRootState>
  ) =>
    Redux.createAct('[geom] update geom', { geomKey, updates }),
};

export type Action = Redux.ActionsUnion<typeof Act>;

export const Thunk = {
  recomputeGeom: Redux.createThunk(
    '[geom] recompute geom',
    ({ dispatch }, input: { geomKey: string; walls: Geom.Rect[] }) => {
      /**
       * TODO
       */
      dispatch(Act.updateGeom(input.geomKey, {
        walls: input.walls.map(x => x.clone()),
      }));
    },
  ),
};

export type Thunk = Redux.ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[geom] close geom': {
      return { ...state,
        lookup:Redux.updateLookup(act.pay.geomKey, state.lookup, ({ openCount }) => ({ openCount: openCount - 1 })),
      };
    }
    case '[geom] open geom': {
      return { ...state, lookup: act.pay.geomKey in state.lookup
        ? Redux.updateLookup(act.pay.geomKey, state.lookup, ({ openCount }) => ({ openCount: openCount + 1 }))
        : Redux.addToLookup(createGeomRoot(act.pay.geomKey), state.lookup),
      };
    }
    case '[geom] update geom': {
      return { ...state,
        lookup: Redux.updateLookup(act.pay.geomKey, state.lookup,
          typeof act.pay.updates === 'function'
            ? act.pay.updates
            : () => act.pay.updates as Partial<GeomRootState>,
        ),
      };
    }
    default: return state || testNever(act);
  }
};
