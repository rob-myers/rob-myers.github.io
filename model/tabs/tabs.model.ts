import { CodeFilepathKey, ComponentFilepathKey } from './tabs.content';

/**
 * Internal tab uid, used:
 * - by npm module `flexlayout-react`
 * - as portal keys
 */
 export function getTabInternalId(meta: TabMeta) {
  return meta.key === 'terminal' ? `@${meta.session}` : meta.filepath;
}

export function getTabId(articleKey: string, tabsName: string) {
  return `${articleKey}--tabs--${tabsName}`;
}

export type TabMeta = (
  | { key: 'code'; filepath: CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: ComponentFilepathKey }
  | { key: 'terminal'; session: string }
);
