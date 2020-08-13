import { combineEpics } from 'redux-observable';
import { map, flatMap } from 'rxjs/operators';
import * as portals from 'react-reverse-portal';

import * as Redux from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { filterActs } from './reducer';

export interface State {
  portal: KeyedLookup<BlogAppPortal>;
}

// TODO move to a .model.ts
interface BlogAppPortal {
  /** Portal key */
  key: string;
  /** Blog app identifier */
  componentKey: BlogAppKey;
  portalNode: Redux.Redacted<portals.HtmlPortalNode>;
}
export type BlogAppKey =  (
  | 'Intro'
  | 'Bipartite'
)

const initialState: State = {
  portal: {},
};

export const Act = {
  addComponentPortal: (input: BlogAppPortal) =>
    Redux.createAct('[blog] add component portal', input),
  removeComponentPortal: (input: { portalKey: string }) =>
    Redux.createAct('[blog] remove component portal', input),
};

export type Action = Redux.ActionsUnion<typeof Act>;

export const Thunk = {
  createComponentPortal: Redux.createThunk(
    '[blog] create component portal',
    ({ dispatch }, { portalKey, componentKey }: {
      componentKey: BlogAppKey;
      portalKey: string;
    }) => {
      const portalNode = Redux.redact(portals.createHtmlPortalNode());
      portalNode.element.style.overflow = 'auto';
      portalNode.element.style.height = '100%';
      dispatch(Act.addComponentPortal({ key: portalKey, componentKey, portalNode }));
    },
  ),
};

export type Thunk = Redux.ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[blog] add component portal': {
      return { ...state,
        portal: Redux.addToLookup(act.pay, state.portal),
      }
    };
    case '[blog] remove component portal': return { ...state,
      portal: Redux.removeFromLookup(act.pay.portalKey, state.portal),
    };
    default: return state || testNever(act);
  }
};


const Epics = {
  initialize: Redux.createEpic(
    (action$, _state$) => action$.pipe(
      filterActs('persist/REHYDRATE' as any),
      flatMap((_) => [],
      ),
    ),
  ),
};

export const epic = combineEpics(...Object.values(Epics));
