import React from 'react';
import { css } from 'goober';
import {TabNode, IJsonModel} from 'flexlayout-react';
import classNames from 'classnames';

import * as Lookup from 'model/tabs-lookup';
import {CodeEditor} from 'components/dynamic';

export function factory(node: TabNode) {
  const { key: nodeKey, folds } = node.getConfig() as {
    key: TabMeta['key'];
    folds?: CodeMirror.Position[];
  };

  switch (nodeKey) {
    case 'code': {
      const filepath = node.getComponent() || '';
      if (filepath in Lookup.code) {
        return (
          <div style={{ height: '100%', background: '#444' }}>
            <CodeEditor
              height="100%"
              lineNumbers
              readOnly
              code={Lookup.code[filepath as Lookup.CodeFilepathKey]}
              folds={folds}
            />
          </div>
        );
      }
      return (
        <ErrorMessage>
          Unknown code with filepath {filepath}
        </ErrorMessage>
      );
    }
    case 'component': {
      const componentKey = node.getComponent() || '';
      if (componentKey in Lookup.component) {
        return (
          React.createElement(Lookup.component[componentKey as Lookup.ComponentFilepathKey])
        );
      }
    }
    default:
      return (
        <ErrorMessage>
          Unknown TabNode with name {nodeKey}
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
          id: `${meta.key}@${meta.filepath}`,
          name: meta.key === 'code'
            ? meta.filepath
            // : meta.filepath.slice(0, -4), // sans .jsx
            : meta.filepath.split('/').pop()!.slice(0, -4),
          config: {
            key: meta.key,
            folds: 'folds' in meta ? meta.folds : undefined,
          },
          component: meta.filepath,
          enableClose: false,
        })),
      }],
    }
  };
}

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <section>
      <strong>{children}</strong>
    </section>
  );
}

export function LoadingOverlay(props: { fade: boolean }) {
  return (
    <div className={classNames(overlayCss, { 'fade-out': props.fade })}>
      <div><div className="message">Loading...</div></div>
    </div>
  );
}

const overlayCss = css`
  pointer-events: none;
  position: absolute;
  z-index: 5;
  width: inherit;
  height: inherit;
  background: #000;
  display: flex;
  justify-content: center;

  > div {
    display: flex;
    align-items: center;
  }
  .message {
    font-family: sans-serif;
    color: #ccc;
    background: #444;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
  }

  opacity: 1;
  transition: opacity 1s ease-in;
  &.fade-out {
    opacity: 0;    
  }
`;
