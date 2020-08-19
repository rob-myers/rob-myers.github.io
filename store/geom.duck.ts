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
  openGeom: (geomKey: string) =>
    Redux.createAct('[geom] open geom', { geomKey }),
  closeGeom: (geomKey: string) =>
    Redux.createAct('[geom] close geom', { geomKey }),
};

export type Action = Redux.ActionsUnion<typeof Act>;

export const Thunk = {
  // TODO remove once have useful thunk
  createPolygon: Redux.createThunk(
    '[geom] create polygon',
    (_, poly: Geom.PolygonJson) => Geom.Polygon.from(poly),
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
    default: return state || testNever(act);
  }
};
