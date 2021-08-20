import React, { useMemo } from "react";
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import styled from '@emotion/styled';

import * as Lookup from 'model/tabs-lookup';
import { CodeEditor } from 'components/dynamic';
import CodeMirror from "codemirror";
import { ErrorMessage, Tab, TabMeta } from "./Tab";

export function Tabs({ tabs, height = "300px" }: Props) {
  const model = useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  return (
    <TabsRoot height={height}>
      <Layout
        model={model}
        factory={factory}
      />
    </TabsRoot>
  );
}

interface Props {
  tabs: TabMeta[];
  height?: string;
}

const TabsRoot = styled('div')<{ height: string }>`
  position: relative;
  width: 100%;
  height: ${(props) => props.height};
  border: 1px solid #555;
  
  .flexlayout__tab_button_content {
    user-select: none;
    font-size: 12px;
    /* font-family: Courier, monospace; */
  }
  .flexlayout__tab {
    /* background: black;
    color: white; */
  }
`;

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
            />
        </Tab>;
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
          <Tab>
            {React.createElement(Lookup.component[componentKey as Lookup.ComponentFilepathKey])}
          </Tab>
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
