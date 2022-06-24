import type { IJsonModel } from 'flexlayout-react';
import type { CodeFilepathKey, ComponentFilepathKey } from './lookup';
import { deepClone, testNever } from 'projects/service/generic';

/**
 * Internal tab uid used by npm module `flexlayout-react`,
 * and also as portal keys.
 */
export function getTabInternalId(meta: TabMeta) {
  return `${getTabName(meta)}${meta.idSuffix || ''}`;
}

export function getTabName(meta: TabMeta) {
  switch (meta.type) {
    case 'code':
    case 'component':
      return meta.filepath;
    case 'terminal':
      return `@${meta.filepath}`;
    default:
      throw testNever(meta);
  }
}

export function getTabsId(articleKey: string, tabsName: string) {
  return `${articleKey}--tabs--${tabsName}`;
}

export type TabMeta = { idSuffix?: string; weight?: number; } & (
  | { type: 'code'; filepath: CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { type: 'component'; filepath: ComponentFilepathKey; }
  | { type: 'terminal'; /** Session identifier */ filepath: string; env?: Record<string, any>; }
);

export function computeJsonModel(tabs: [TabMeta[], TabMeta[]]): IJsonModel {
  return {
    global: {
      tabEnableRename: false,
      rootOrientationVertical: true,
      tabEnableClose: false,
    },
    layout: {
      type: 'row',
      /**
       * One row for each `meta` in tabs[0].
       * The 1st such row additionally contains `tabs[1]`.
       */
      children: tabs[0].map((meta, i) => ({
        type: 'row',
        weight: meta.weight,
        children: i === 0
          ? ([
              {
                type: 'tabset',
                children: [meta, ...tabs[1]].map(innerMeta => ({
                  type: 'tab',
                  /**
                   * Tabs must not be duplicated within same `Tabs`,
                   * for otherwise this internal `id` will conflict.
                   */
                  id: getTabInternalId(innerMeta),
                  name: getTabName(innerMeta),
                  config: deepClone(innerMeta),
                  // component: meta.key === 'terminal' ? 'terminal' : meta.filepath,
                }))
              },
            ])
          : ([
            {
              type: 'tabset',
              children: [{
                type: 'tab',
                /**
                 * Tabs must not be duplicated within same `Tabs`,
                 * for otherwise this internal `id` will conflict.
                 */
                id: getTabInternalId(meta),
                name: getTabName(meta),
                config: deepClone(meta),
              }]
            },
          ]),
      })),
    }
  };
}
