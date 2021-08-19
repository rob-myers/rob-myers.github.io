import React, { useMemo } from "react";
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import styled from '@emotion/styled';

import * as Lookup from 'model/tabs-lookup';
import { CodeEditor } from 'components/dynamic';
import CodeMirror from "codemirror";

export function Tabs({ tabs }: Props) {
  const model = useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  return (
    <TabsRoot>
      <Layout
        model={model}
        factory={factory}
      />
    </TabsRoot>
  );
}

interface Props {
  tabs: TabMeta[];
}

type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);

const TabsRoot = styled('div')`
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid #555;

  .flexlayout__tab_button_content {
    user-select: none;
    font-size: 12px;
    font-family: Courier, monospace;
  }
  .flexlayout__tab {
    background: white;
    color: black;
  }
`;

function computeJsonModel(tabs: TabMeta[]): IJsonModel {
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
          name: meta.key === 'code'
            ? meta.filepath
            : meta.filepath.slice(0, -4), // sans .jsx
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

function factory(node: TabNode) {
  const { key: nodeKey, folds } = node.getConfig() as {
    key: TabMeta['key'];
    folds?: CodeMirror.Position[];
  };

  switch (nodeKey) {
    case 'code': {
      const filepath = node.getComponent() || '';
      if (filepath in Lookup.code) {
        return <Tab>
          <CodeEditor
              height="100%"
              // padding="16px 0"
              lineNumbers
              readOnly
              code={Lookup.code[filepath as Lookup.CodeFilepathKey]}
              folds={folds}
            />;
        </Tab>;
      }
      return <ErrorMessage>Unknown code with filepath {filepath}</ErrorMessage>;
    }
    case 'component': {
      const componentKey = node.getComponent() || '';
      if (componentKey in Lookup.component) {
        const FC = Lookup.component[componentKey as Lookup.ComponentFilepathKey];
        return <Tab><FC/></Tab>
      }
      return <ErrorMessage>Unknown function component with name {componentKey}</ErrorMessage>;
    }
    default:
      return <ErrorMessage>Unknown TabNode with name {nodeKey}</ErrorMessage>;
  }
}

function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return <section><strong>{children}</strong></section>;
}

function Tab({ children }: React.PropsWithChildren<{}>) {
  return (
    <TabRoot>
      <TabToolbar />
      <div className="tab-content">{children}</div>
    </TabRoot>
  );
}

const TabRoot = styled('section')`
  height: 100%;
  font-size: 14px;
  position: relative;

  .tab-toolbar {
    background: #444;
      color: white;
      position: absolute;
      top: 0;
      width: 100%;
      height: 32px;
      padding: 6px 8px;
  }

  .tab-content {
    position: absolute;
    top: 32px;
    width: 100%;
    height: calc(100% - 32px);
  }
`;

function TabToolbar() {
  return (
    <div className="tab-toolbar">
      toolbar goes here
    </div>
  );
}