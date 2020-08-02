import { createThunk, ActionsUnion } from '@model/store/redux.model';
import { State as GeomState, PolygonJson, EdgeJson } from '@public-reducer/geom.types';
import Flatten from '@flatten-js/core';

export type State = GeomState;

const initialState: State = {};

export const Act = {};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  createEdge: createThunk(
    '[geom] create edge',
    (_, json: EdgeJson) => {
      if (json.name === 'arc') {
        return Flatten.arc(
          Flatten.point(json.pc.x, json.pc.y),
          json.r,
          json.startAngle,
          json.endAngle,
          json.counterClockwise ? Flatten.ArcOrientationType.CCW : Flatten.ArcOrientationType.CW,
        )
      }
      return Flatten.segment(
        Flatten.point(json.ps.x, json.ps.y),
        Flatten.point(json.pe.x, json.pe.y),
      );
    },
  ),
  createPolygon: createThunk(
    '[geom] create polygon',
    ({ dispatch }, { faces }: PolygonJson): Flatten.Polygon => {
      const edges = faces.map(({ edges }) => edges
        .map((edge) => dispatch(Thunk.createEdge(edge))));
      return new Flatten.Polygon(edges);
    }
  ),

};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
