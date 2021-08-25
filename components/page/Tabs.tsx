import React from "react";
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import { styled } from 'goober';

import * as Lookup from 'model/tabs-lookup';
import CodeEditor from 'components/code/WrappedCodeEditor';
import CodeMirror from "codemirror";
import { ErrorMessage, Tab, TabMeta } from "./Tab";

export default function Tabs({ tabs, height = "300px" }: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  return (
    <TabsRoot height={height}>
      <Layout model={model} factory={factory} />
    </TabsRoot>
  );
}

interface Props {
  tabs: TabMeta[];
  height?: string;
}

const TabsRoot = styled('div')<{ height: string }>`
  padding-bottom: 16px;
  > div {
    position: relative;
    height: ${(props) => props.height};
    padding: 16px 0;
  }
  
  .flexlayout__tabset_tabbar_outer {
    background: #222;
    border-bottom: 1px solid #555;
  }
  .flexlayout__tab_button--selected, .flexlayout__tab_button:hover {
    background: #444;
  }
  .flexlayout__tab_button_content {
    user-select: none;
    font-size: 13px;
    color: #aaa;
  }
  .flexlayout__tab_button--selected .flexlayout__tab_button_content {
    color: #fff;
  }
  .flexlayout__tab_button:hover:not(.flexlayout__tab_button--selected) .flexlayout__tab_button_content {
    color: #ddd;
  }
  .flexlayout__splitter_vert, .flexlayout__splitter_horz {
    background: #827575;
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
        return (
          <Tab>
            <CodeEditor
              height="100%"
              lineNumbers
              readOnly
              code={Lookup.code[filepath as Lookup.CodeFilepathKey]}
              folds={folds}
            />
          </Tab>
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
