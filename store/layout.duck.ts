import * as GoldenLayout from 'golden-layout';
import { Redacted, ActionsUnion, createAct, updateLookup, redact, removeFromLookup, addToLookup } from '@model/store/redux.model';
import { KeyedLookup, testNever, deepClone } from '@model/generic.model';
import { LayoutPanelMeta, ExtendedContainer, GoldenLayoutConfig } from '@model/layout/layout.model';
import { createThunk } from '@model/store/root.redux.model';
import { initLayoutConfig } from '@model/layout/example-layout.model';

/** Assume exactly one layout. */
export interface State {
  /** Initial config inducing `goldenLayout`. */
  initConfig: GoldenLayoutConfig;
  /** Native instance of `GoldenLayout`. */
  goldenLayout: null | Redacted<GoldenLayout>;
  /** Lookup to keep track of layout panels. */
  panel: KeyedLookup<LayoutPanelState>;
}

export interface LayoutPanelState {
  key: string;
  /**
   * Has this panel been initialized?
   * Panels with initial width and height 0 have not.
   */
  initialized: boolean;
  /** Width of the panel in pixels. */
  width: number;
  /** Height of the panel in pixels. */
  height: number;
  /** Last time panel was resized (epoch ms). */
  resizedAt: null | number;
  /**
   * Metadata concerning panel, e.g.
   * login session panels have a `sessionKey`.
   */
  panelMeta: LayoutPanelMeta<string>;
  /** Store native container in state, so can e.g. set title. */
  container: Redacted<ExtendedContainer>;
}

const initialState: State = {
  initConfig: initLayoutConfig,
  goldenLayout: null,
  panel: {},
};

export const Act = {
  assignPanelMetas: (input: {
    panelKey: string;
    panelMeta: { [panelMetaKey in string]?: string; };
  }) => createAct('[layout] assign panel metas', input),
  initialized: (input: {
    config: GoldenLayoutConfig;
    goldenLayout: Redacted<GoldenLayout>;
  }) => createAct('[layout] initialized', input),
  panelOpened: (input: {
    panelKey: string;
    width: number;
    height: number;
    container: Redacted<ExtendedContainer>;
  }) => createAct('[layout] panel opened', input),
  panelClosed: (input: {
    panelKey: string;
  }) => createAct('[layout] panel closed', input),
  panelResized: (input: {
    panelKey: string;
    width: number;
    height: number;
  }) => createAct('[layout] panel resized', input),
  panelShown: (input: {
    panelKey: string;
    width: number;
    height: number;
  }) => createAct('[layout] panel shown', input),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  setPanelTitle: createThunk(
    '[layout] set panel title thunk',
    ({ state: { layout: { panel }}}, input: {
      panelKey: string;
      title: string;
    }) => {
      panel[input.panelKey]?.container.setTitle(input.title);
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[layout] assign panel metas': {
      const { panelMeta: next, panelKey } = act.pay;
      return { ...state,
        panel: updateLookup(panelKey, state.panel, ({ panelMeta }) =>
          ({ panelMeta: { ...panelMeta, ...next } }))
      };
    }
    case '[layout] initialized': {
      const { config, goldenLayout } = act.pay;
      return {
        ...state,
        initConfig: deepClone(config),
        goldenLayout: redact(goldenLayout, 'GoldenLayout'),
      };
    }
    case '[layout] panel opened': {
      const { panelKey, width, height, container } = act.pay;
      const newPanel: LayoutPanelState = {
        key: panelKey,
        initialized: (width && height) ? true : false,
        width,
        height,
        resizedAt: null,
        panelMeta: {},
        container,
      };
      return { ...state,
        panel: addToLookup(newPanel, state.panel),
      };
    }
    case '[layout] panel closed': {
      return { ...state,
        panel: removeFromLookup(act.pay.panelKey, state.panel),
      };
    }
    case '[layout] panel resized': {
      const { panelKey, width, height } = act.pay;
      return { ...state,
        panel: updateLookup(
          panelKey, state.panel, () => ({
            // NOTE may still not be initialized
            width, height, resizedAt: Date.now(),
          })),
      };
    }
    case '[layout] panel shown': {
      const { panelKey, width, height } = act.pay;
      return { ...state,
        panel: updateLookup(panelKey, state.panel, ({ initialized }) => ({
          // Can become initialized via show.
          initialized: initialized || (width && height ? true : false),
          width, height,
        }))
      };
    }
    default: return state || testNever(act);
  }
};
