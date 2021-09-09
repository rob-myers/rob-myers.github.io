import React from 'react';
import { css } from 'goober';
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import CodeMirror from 'codemirror';
import classNames from 'classnames';

import * as Lookup from 'model/tabs-lookup';
import {CodeEditor} from 'components/dynamic';
import Tab, { ErrorMessage, TabMeta } from './Tab';
import useSiteStore from 'store/site.store';

export default function Tabs({ tabs, height, storeKey }: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  const rootRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (storeKey) {
      useSiteStore.getState().tabs[storeKey] = {
        key: storeKey,
        model,
        scrollIntoView: () => rootRef.current?.scrollIntoView({ behavior: 'smooth'  }),
      };
      return () => void delete useSiteStore.getState().tabs[storeKey];
    }
  }, [model]);

  return (
    <section
      className={classNames("tabs", "scrollable", rootCss(height))}
      ref={rootRef}
    >
      <Layout
        model={model}
        factory={factory}
      />
    </section>
  );
}

interface Props {
  storeKey?: string;
  height: number;
  tabs: TabMeta[];
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

const rootCss = (height: number) => css`
  margin: 40px 0;
  @media(max-width: 600px) {
    margin: 0;
  }

  > .flexlayout__layout {
    background: #444;
    position: relative;
    height: ${height}px;
  }
  .flexlayout__tab {
    /* border: 1px solid rgba(0, 0, 0, 0.3); */
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
