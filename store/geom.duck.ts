import { ActionsUnion, createThunk } from '@model/store/redux.model';
import { GeomService } from '@model/geom/geom.service';
import * as Geom from '@model/geom/geom.model';

export interface State {
  service: GeomService;
}

const initialState: State = {
  service: new GeomService,
};

export const Act = {};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  // TODO remove once have useful thunk
  createPolygon: createThunk(
    '[geom] create polygon',
    (_, poly: Geom.PolygonJson) => Geom.Polygon.from(poly),
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
