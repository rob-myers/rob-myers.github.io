import type { IJsonModel } from 'flexlayout-react';
import { CodeFilepathKey, ComponentFilepathKey } from './tabs.content';

/**
 * Internal tab uid used by npm module `flexlayout-react`,
 * and also as portal keys.
 */
 export function getTabInternalId(meta: TabMeta) {
  return meta.key === 'terminal' ? `@${meta.session}` : meta.filepath;
}

export function getTabsId(articleKey: string, tabsName: string) {
  return `${articleKey}--tabs--${tabsName}`;
}

export type TabMeta = (
  | { key: 'code'; filepath: CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: ComponentFilepathKey; props?: TabComponentProps }
  | { key: 'terminal'; session: string }
);

export type TabComponentProps = Record<string, string | number | boolean>;

export function computeJsonModel(tabs: TabMeta[]): IJsonModel {
  return {
    global: {
      tabEnableRename: false,
    },
    layout: {
      type: 'row',
      weight: 100,

      children: [{
        type: 'tabset',
        weight: 50,
        selected: 0,

        children: tabs.map((meta) => ({
          type: 'tab',
          /**
           * Tabs must not be duplicated within same `Tabs`,
           * for otherwise this internal `id` will conflict.
           */
          id: getTabInternalId(meta),
          name: getTabInternalId(meta),
          config: meta,
          // component: meta.key === 'terminal' ? 'terminal' : meta.filepath,
          enableClose: false,
        })),
      }],
    }
  };
}
