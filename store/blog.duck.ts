import * as portals from 'react-reverse-portal';
import * as Redux from '@model/store/redux.model';
import { KeyedLookup } from '@model/generic.model';

export interface State {
  portal: KeyedLookup<BlogAppPortal>;
}

interface BlogAppPortal {
  /** Portal key */
  key: string;
  /** Blog app identifier */
  componentKey: BlogAppKey;
  portalNode: Redux.Redacted<portals.HtmlPortalNode>;
}
type BlogAppKey = 'intro' | 'bipartite';

const initialState: State = {
  portal: {},
};

const Act = {
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
    default: return state;
  }
};
