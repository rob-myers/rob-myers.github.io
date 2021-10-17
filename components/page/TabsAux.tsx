import React from 'react';
import { TabNode, IJsonModel } from 'flexlayout-react';
import { css } from 'goober';

import * as Lookup from 'model/tabs-lookup';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';

export function factory(node: TabNode) {
  const { key: nodeKey, folds } = node.getConfig() as {
    key: TabMeta['key'];
    folds?: CodeMirror.Position[];
  };
  
  switch (nodeKey) {
    case 'code': {
      const componentKey = node.getComponent() as string;
      if (componentKey in Lookup.code) {
        return (
          <div style={{ height: '100%', background: '#444' }}>
            <CodeEditor
              height="100%"
              lineNumbers
              readOnly
              code={Lookup.code[componentKey as Lookup.CodeFilepathKey]}
              folds={folds}
            />
          </div>
        );
      }
      return (
        <ErrorMessage>
          Unknown code with filepath {componentKey}
        </ErrorMessage>
      );
    }
    case 'component': {
      const componentKey = node.getComponent() as string;
      if (componentKey in Lookup.component) {
        return React.createElement(
          Lookup.component[componentKey as Lookup.ComponentFilepathKey]
        );
      }
    }
    case 'terminal': {
      const sessionKey = node.getConfig().session as string;
      const env = {
        test: {}, // TODO
      };
      return <Terminal sessionKey={sessionKey} env={env} />;
    }
    default:
      return (
        <ErrorMessage>
          ⚠️ Unknown <em>TabNode</em> with name "{nodeKey}".
        </ErrorMessage>
      );
  }
}

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
          config: {
            key: meta.key,
            folds: 'folds' in meta ? meta.folds : undefined,
            session: 'session' in meta ? meta.session : undefined,
          },
          component: meta.key === 'terminal' ? 'terminal' : meta.filepath,
          enableClose: false,
        })),
      }],
    }
  };
}

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
  | { key: 'terminal'; session: string }
);

/** Compute internal tab uid used by npm module `flexlayout-react`  */
export function getTabInternalId(meta: TabMeta) {
  return meta.key === 'terminal' ? `@${meta.session}` : meta.filepath;
}

export function getTabId(articleKey: string, tabsName: string) {
  return `${articleKey}--tabs--${tabsName}`;
}

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className={errorCss}>
      <strong>{children}</strong>
    </div>
  );
}

const errorCss = css`
  margin: 24px;
  color: red;
  font-size: 1.2rem;
  font-family: monospace;
`;

