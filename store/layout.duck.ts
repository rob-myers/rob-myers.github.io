import * as GoldenLayout from 'golden-layout';
import { Redacted, ActionsUnion, createAct, updateLookup, redact, removeFromLookup, addToLookup } from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { LayoutPanelMeta, ExtendedContainer, GoldenLayoutConfig } from '@model/layout/layout.model';
import { createThunk } from '@model/store/root.redux.model';
import { CustomPanelMetaKey, getDefaultLayoutConfig } from '@model/layout/example-layout.model';

/** Assume exactly one layout. */
export interface State {
  /** We use this config to change configs. */
  nextConfig: GoldenLayoutConfig;
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
  /** Metadata concerning panel e.g. filename. */
  panelMeta: LayoutPanelMeta<string>;
  /** Store native container in state, so can e.g. set title. */
  container: Redacted<ExtendedContainer>;
}

const getInitialState = (): State => ({
  nextConfig: getDefaultLayoutConfig(),
  goldenLayout: null,
  panel: {},
});

export const Act = {
  assignPanelMetas: (input: {
    panelKey: string;
    panelMeta: { [panelMetaKey in string]?: string; };
  }) => createAct('[layout] assign panel metas', input),
  initialized: (input: { goldenLayout: Redacted<GoldenLayout> }) =>
    createAct('[layout] initialized', input),
  panelCreated: (input: {
    panelKey: string;
    width: number;
    height: number;
    container: Redacted<ExtendedContainer>;
    panelMeta: LayoutPanelMeta<CustomPanelMetaKey>;
  }) => createAct('[layout] panel created', input),
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
  setNextConfig: (input: {
    nextConfig: GoldenLayoutConfig;
  }) => createAct('[layout] set next config', input),
  triggerPersist: () =>
    createAct('[layout] trigger persist', {}),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  clickedPanelTitle: createThunk(
    '[layout] clicked panel title',
    (_, __: { panelKey: string }) => null,
  ),
  setLayout: createThunk(
    '[layout] set layout',
    ({ dispatch }, { layoutId }: { layoutId: string }) => {
      if (layoutId === 'default-layout') {
        dispatch(Act.setNextConfig({ nextConfig: getDefaultLayoutConfig() }));
      } else {
        console.warn(`unrecognised layout id "${layoutId}" was ignored`);
      }
    },
  ),
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

export const reducer = (state = getInitialState(), act: Action): State => {
  switch (act.type) {
    case '[layout] assign panel metas': {
      const { panelMeta: next, panelKey } = act.pay;
      return { ...state,
        panel: updateLookup(panelKey, state.panel, ({ panelMeta }) =>
          ({ panelMeta: { ...panelMeta, ...next } }))
      };
    }
    case '[layout] initialized': {
      const { goldenLayout } = act.pay;
      return {
        ...state,
        goldenLayout: redact(goldenLayout, 'GoldenLayout'),
      };
    }
    case '[layout] panel created': {
      const { panelKey, width, height, container, panelMeta } = act.pay;
      const newPanel: LayoutPanelState = {
        key: panelKey,
        initialized: (width && height) ? true : false,
        width,
        height,
        resizedAt: null,
        panelMeta,
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
    case '[layout] set next config': {
      return { ...state,
        nextConfig: act.pay.nextConfig,
      };
    }
    case '[layout] trigger persist': {
      return { ...state };
    }
    default: return state || testNever(act);
  }
};
