import Flatten from '@flatten-js/core';
import { createThunk, ActionsUnion } from '@model/store/redux.model';
import { GeomService } from '@model/geom/geom.service';
import { State as GeomState, PolygonJson, EdgeJson } from '@public-reducer/geom.types';

export interface State extends GeomState {
  service: GeomService; // Invisible to runtime state
}

const initialState: State = {
  service: new GeomService,
};

export const Act = {};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  createPolygon: createThunk(
    '[geom] create polygon',
    ({ state: { geom } }, json: PolygonJson): Flatten.Polygon => {
      return geom.service.toPolygon(json);
    }
  ),

};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
