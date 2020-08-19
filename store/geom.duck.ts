import { KeyedLookup, testNever, pluck } from '@model/generic.model';
import { traverseDom } from '@model/dom.model';
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
  traverseDom: Redux.createThunk(
    '[geom] recompute geom',
    ({ state: { geom }, dispatch }, { geomKey, rootEl, ancestralCtm, css }: {
      geomKey: string;
      rootEl: SVGGElement;
      ancestralCtm: DOMMatrix;
      css: { [label: string]: string };
    }) => {
      console.log('recomputing GeomRoot', geomKey);

      const file = geom.lookup[geomKey];
      const invertedUiMatrix = ancestralCtm;
      const nextTables = {} as { [itemKey: string]: Geom.Rect };
      const nextWalls = {} as { [itemKey: string]: Geom.Rect };

      traverseDom(rootEl, (el) => {
        if (el instanceof SVGRectElement) {
          const bbox = el.getBBox();
          const matrix = invertedUiMatrix.multiply((el.getCTM()!));
          const rect = Geom.Rect.fromPoints(
            matrix.transformPoint(bbox),
            matrix.transformPoint({ x: bbox.x + bbox.width, y: bbox.y + bbox.height }),
          );

          if (el.classList.contains(css.wall)) {
            nextWalls[`${rect}`] = rect;
          } else if (el.classList.contains(css.table)) {
            nextTables[`${rect}`] = rect;
          }
        }
      });
      
      let prevKeys = file.walls.map(x => `${x}`);
      if (prevKeys.length !== Object.keys(nextWalls).length || prevKeys.some(key => !nextWalls[key])) {
        console.log('geometry has changed (walls)')
        dispatch(Act.updateGeom(geomKey, { walls: Object.values(nextWalls) }));
      }

      prevKeys = file.tables.map(x => `${x}`);
      if (prevKeys.length !== Object.keys(nextTables).length || prevKeys.some(key => !nextTables[key])) {
        console.log('geometry has changed (tables)')
        dispatch(Act.updateGeom(geomKey, { tables: Object.values(nextTables) }));
      }

      /**
       * TODO compute & show navmesh
       */
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
