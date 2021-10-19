import React, { useEffect } from 'react';
import { TabNode, IJsonModel } from 'flexlayout-react';
import { css } from 'goober';

import { getTabInternalId, TabMeta } from 'model/tabs/tabs.model';
import { getCode, getComponent } from 'model/tabs/tabs.content';
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';

export function factory(node: TabNode) {
  
  const meta = node.getConfig() as TabMeta;

  /**
   * TODO use <Portal>
   */
  switch (meta.key) {
    case 'code': {
      return (
        <div style={{ height: '100%', background: '#444' }}>
          <CodeEditor
            height="100%"
            lineNumbers
            readOnly
            code={getCode(meta.filepath)}
            folds={meta.folds}
          />
        </div>
      );
    }
    case 'component': {
      const [component, setComponent] = React.useState<() => JSX.Element>();
      useEffect(() => {// setState(() => func) avoids setState(prev => next)
        getComponent(meta.filepath).then(x => setComponent(() => x));
      }, []);
      return component ? React.createElement(component) : null;
    }
    case 'terminal': {
      const env = {
        test: {}, // TODO
      };
      return <Terminal sessionKey={meta.session} env={env} />;
    }
    default:
      return (
        <ErrorMessage>
          ⚠️ Unknown <em>TabNode</em> with name "{(meta as any).key}".
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
          config: meta,
          component: meta.key === 'terminal' ? 'terminal' : meta.filepath,
          enableClose: false,
        })),
      }],
    }
  };
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

