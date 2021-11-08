import type { IJsonModel } from 'flexlayout-react';
import { deepClone, testNever } from 'model/generic.model';
import { CodeFilepathKey, ComponentFilepathKey } from './tabs.lookup';

/**
 * Internal tab uid used by npm module `flexlayout-react`,
 * and also as portal keys.
 */
export function getTabInternalId(meta: TabMeta) {
  return `${getTabName(meta)}${meta.idSuffix || ''}`;
}

function getTabName(meta: TabMeta) {
  switch (meta.key) {
    case 'code':
    case 'component':
      return meta.filepath;
    case 'terminal':
      return `@${meta.session}`;
    default:
      throw testNever(meta);
  }
}

export function getTabsId(articleKey: string, tabsName: string) {
  return `${articleKey}--tabs--${tabsName}`;
}

export type TabMeta = { idSuffix?: string } & (
  | { key: 'code'; filepath: CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: ComponentFilepathKey; }
  | { key: 'terminal'; session: string }
);

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

        children: tabs.map((meta) => {
          // console.log('json model', meta);
          return {
            type: 'tab',
            /**
             * Tabs must not be duplicated within same `Tabs`,
             * for otherwise this internal `id` will conflict.
             */
            id: getTabInternalId(meta),
            name: getTabName(meta),
            config: deepClone(meta),
            // component: meta.key === 'terminal' ? 'terminal' : meta.filepath,
            enableClose: false,
          };
        }),
      }],
    }
  };
}
