import React from 'react';
import { css } from 'goober';
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import CodeMirror from 'codemirror';
import classNames from 'classnames';

import * as Lookup from 'model/tabs-lookup';
import {CodeEditor} from 'components/dynamic';
import Tab, { ErrorMessage, TabMeta } from './Tab';

export default function Tabs({ tabs, height }: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  return (
    <section
      className={classNames("tabs", "scrollable", rootCss(height))}
    >
      <Layout model={model} factory={factory} />
    </section>
  );
}

interface Props {
  height: number;
  tabs: TabMeta[];
  indent?: string;
}

const rootCss = (height: number) => css`
  padding: var(--tabs-vert-indent) var(--blog-indent);

  background: var(--blog-bg);
  @media(min-width: 600px) {
    background-image: linear-gradient(135deg, #dddddd 42.86%, #bbbbbb 42.86%, #bbbbbb 50%, #dddddd 50%, #dddddd 92.86%, #bbbbbb 92.86%, #bbbbbb 100%);
    background-size: 9.90px 9.90px;
  }
  border: 2px solid #ccc;
  border-width: 0 2px;

  > .flexlayout__layout {
    background: #444;
    position: relative;
    height: ${height}px;
  }
  .flexlayout__tab {
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-top: 6px solid #444;
    position: relative;
    /** Handle svg overflow */
    overflow: hidden;
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
