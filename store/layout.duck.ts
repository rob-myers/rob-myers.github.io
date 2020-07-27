import * as GoldenLayout from 'golden-layout';
import { Redacted, ActionsUnion, createAct, updateLookup, redact, removeFromLookup, addToLookup } from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { LayoutPanelMeta, ExtendedContainer, GoldenLayoutConfig, traverseGlConfig, mapGlConfig } from '@model/layout/layout.model';
import { createThunk } from '@model/store/root.redux.model';
import { CustomPanelMetaKey, getDefaultLayoutConfig, getDefaultEmptyLayout } from '@model/layout/generate-layout';
import { CustomLayoutPanelMeta } from '@model/dev-env/dev-env.model';

/** Assume exactly one layout. */
export interface State {
  /** Native instance of `GoldenLayout`. */
  goldenLayout: null | Redacted<GoldenLayout>;
  /** We use this config to change configs. */
  nextConfig: GoldenLayoutConfig;
  /** Lookup to keep track of layout panels. */
  panel: KeyedLookup<LayoutPanelState>;
  /** Key where to save config inside `savedConfig`. */
  persistKey: null | string;
  /** Stored layouts */
  savedConfig: KeyedLookup<SavedGoldenLayoutConfig>;
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

interface SavedGoldenLayoutConfig {
  key: string;
  config: GoldenLayoutConfig;
}

const getInitialState = (): State => ({
  goldenLayout: null,
  nextConfig: getDefaultLayoutConfig(),
  panel: {},
  persistKey: null,
  savedConfig: {},
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
  saveConfig: (input: { key: string; config: GoldenLayoutConfig; }) =>
    createAct('[layout] save config', input),
  setNextConfig: (input: { nextConfig: GoldenLayoutConfig; }) =>
    createAct('[layout] set next config', input),
  setPersistKey: (persistKey: null | string) =>
    createAct('[layout] set persist key', { persistKey }),
  triggerPersist: () =>
    createAct('[layout] trigger persist', {}),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  clickedPanelTitle: createThunk(
    '[layout] clicked panel title',
    (_, __: { panelKey: string }) => null,
  ),
  closeMatchingPanels: createThunk(
    '[layout] close matching panels',
    ({ state: { layout }, dispatch }, { predicate }: {
      predicate: (meta: CustomLayoutPanelMeta) => boolean;
    }) => {
      const nextConfig = mapGlConfig(layout.nextConfig!, (x) =>
        'type' in x
        && x.type === 'component'
        && x.props.panelMeta
        && predicate(x.props.panelMeta) ? null : x
      ) as GoldenLayoutConfig | null;
      dispatch(Act.setNextConfig({
        nextConfig: nextConfig || getDefaultEmptyLayout(),
      }));
    },
  ),
  /**
   * When switching between pages we cannot rely on rehydrate,
   * presumably because persist is invoked?
   */
  saveCurrentLayout: createThunk(
    '[layout] save current layout',
    ({ state: { layout: { goldenLayout } }, dispatch }) => {
      dispatch(Act.setNextConfig({
        nextConfig: goldenLayout?.toConfig() || getDefaultLayoutConfig(),
      }));
    },
  ),
  setLayout: createThunk(
    '[layout] set layout',
    ({ dispatch, state: { layout } }, { layoutId }: { layoutId: string }) => {
      if (layoutId === 'default-layout') {
        const nextConfig = getDefaultLayoutConfig();
        dispatch(Act.setNextConfig({ nextConfig }));
        return nextConfig;
      }
      const nextConfig = layout.savedConfig[layoutId]?.config || getDefaultLayoutConfig();
      dispatch(Act.setPersistKey(layoutId));
      dispatch(Act.setNextConfig({ nextConfig }));
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
    case '[layout] save config': {
      return { ...state,
        savedConfig: addToLookup(act.pay, state.savedConfig),
      };
    }
    case '[layout] set next config': {
      return { ...state,
        nextConfig: act.pay.nextConfig,
        ...(state.persistKey && {
          savedConfig: addToLookup({
            key: state.persistKey,
            config: act.pay.nextConfig,
          }, state.savedConfig),
        }),
      };
    }
    case '[layout] set persist key': {
      return { ...state,
        persistKey: act.pay.persistKey,
      };
    }
    case '[layout] trigger persist': {
      return { ...state };
    }
    default: return state || testNever(act);
  }
};
