import { createThunk, ActionsUnion } from '@model/store/redux.model';
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
  createPolygon: createThunk(
    '[geom] create polygon',
    (_, poly: Geom.PolygonJson) => Geom.Polygon.from(poly),
  ),
  insetPolygon: createThunk(
    '[geom] inset polygon',
    ({ state: { geom } }, input: { poly: Geom.PolygonJson; amount: number }) => {
      const poly = Geom.Polygon.from(input.poly);
      return geom.service.inset(poly, input.amount);
    }
  ),
  rectDecompose: createThunk(
    '[geom] decompose as rects',
    ({ state: { geom } }, polyJson: Geom.PolygonJson): Geom.Rect[] => {
      const poly = Geom.Polygon.from(polyJson);
      return geom.service.computeRectPartition(poly);
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
