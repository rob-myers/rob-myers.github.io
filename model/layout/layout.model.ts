import * as GoldenLayout from 'golden-layout';

/**
 * To define a layout for golden-layout, one must define
 * a `GoldenLayoutConfig`. Its `content` field is built
 * recursively from `GoldenLayoutConfigItem`s.
 * Each of the latter has a `type` i.e.
 * 'row', 'column', 'stack', 'component' or 'react-component'.
 * The latter normalises to 'component' in golden-layout.
 */

/**
 * Extends native with stricter/extended `content` field.
 * - Stricter because refine some types.
 * - Extended because want e.g. `props.panelKey`, so React
 * component knows which panel it is in.
 */
export interface GoldenLayoutConfig<PanelMetaKey extends string = string> extends GoldenLayout.Config, GeneralOptions {
  content: GoldenLayoutConfigItem<PanelMetaKey>[];
  settings?: GoldenLayout.Config['settings'] & {
    responsiveMode?: string;
    tabOverlapAllowance?: number;
    reorderOnTabMenuClick?: boolean;
    tabControlOffset?: number;
  };
  dimensions?: GoldenLayout.Config['dimensions'] & {
    borderGrabWidth?: number;
  };
  labels?: GoldenLayout.Config['labels'] & {
    popin?: string;
    tabDropdown?: string;
  };

  title?: string;
  maximisedItemId?: null | string;
  openPopouts?: [];
}

interface GeneralOptions {
  isClosable?: boolean;
  reorderEnabled?: boolean;
}

export interface ExtendedContainer extends GoldenLayout.Container {
  container: GoldenLayout.ContentItem;
  config: GoldenLayoutConfigItem<any>;
  element: JQuery<HTMLElement>;
}

export type GoldenLayoutConfigItem<PanelMetaKey extends string> = GeneralOptions & (
  | RowConfig<PanelMetaKey>
  | ColumnConfig<PanelMetaKey>
  | StackConfig<PanelMetaKey>
  | ComponentConfig<PanelMetaKey>
  | ReactComponentConfig<PanelMetaKey>
);

export interface RowConfig<PanelMetaKey extends string> extends GoldenLayout.ItemConfig {
  // Native value, now with literal type.
  type: 'row';
  // Now required.
  content: GoldenLayoutConfigItem<PanelMetaKey>[];
}
export interface ColumnConfig<PanelMetaKey extends string> extends GoldenLayout.ItemConfig {
  type: 'column';
  content: GoldenLayoutConfigItem<PanelMetaKey>[];
}
export interface StackConfig<PanelMetaKey extends string> extends GoldenLayout.ItemConfig {
  type: 'stack';
  content: GoldenLayoutConfigItem<PanelMetaKey>[];
  activeItemIndex?: number;
  header?: {};
}

/**
 * Most important extension.
 */
export type ReactComponentConfig<PanelMetaKey extends string>
= GoldenLayout.ReactComponentConfig
& BaseComponentConfig<PanelMetaKey>
& { type: 'react-component' };

/**
 * If one specifies a 'react-component' inside `GoldenLayoutConfig`,
 * it will be rewritten as 'component' internally.
 * For this reason, we apply the same constraints to both.
 */
export type ComponentConfig<PanelMetaKey extends string> =
& GoldenLayout.ComponentConfig // Native.
& BaseComponentConfig<PanelMetaKey> // Common extensions.
& { type: 'component' };


export interface BaseComponentConfig<PanelMetaKey extends string> {
  /** Native optional `title` is now required. */
  title: string;
  /**
   * Non-native property i.e. `props.panelKey` prior to duplication.
   * We'll use it generate `props.panelKey` for duplicates.
   */
  origPanelKey?: string;
  /**
   * Extends native property.
   * - We require that props exists.
   * - We require `props.panelKey`.
   * - We permit `props.panelMeta` which can be used
   * to initialize the component loaded into the panel.
   */
  props: LayoutPanelBaseProps<PanelMetaKey> & {
    [key: string]: any;
  };

  component?: string;
}

export interface LayoutPanelBaseProps<PanelMetaKey extends string> {
  /**
   * Non-native property used to track panels in our state-representation.
   * Distinct panels must have distinct `panelKey`s.
   */
  panelKey: string;
  /**
   * Can store e.g. sessionKey here.
   */
  panelMeta?: LayoutPanelMeta<PanelMetaKey>;
}

export type LayoutPanelMeta<PanelMetaKey extends string> = {
  [key in PanelMetaKey]?: string;
}
