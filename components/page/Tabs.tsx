import React from 'react';
import { styled } from 'goober';
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import CodeMirror from 'codemirror';

import * as Lookup from 'model/tabs-lookup';
import {CodeEditor} from 'components/dynamic';
import Tab, { ErrorMessage, TabMeta } from './Tab';

export default function Tabs({ tabs, margin, height }: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  return (
    <TabsRoot className="scrollable" height={height} margin={margin}>
      <Layout model={model} factory={factory}  />
    </TabsRoot>
  );
}

interface Props {
  /** Height of each tab */
  height: number;
  tabs: TabMeta[];
  margin?: string;
}

const TabsRoot = styled('div')<{ height: number; margin?: string }>`
  height: ${(props) => props.height}px;
  background: #444;
  margin: ${props => props.margin || 'auto'};

  > div {
    position: relative;
    height: inherit;
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
          <Tab background="black">
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
