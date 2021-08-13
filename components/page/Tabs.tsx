import React, { useMemo } from "react";
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import styled from '@emotion/styled';
import { css } from "@emotion/react";

import * as Lookup from 'model/tabs-lookup';
import { CodeEditor } from 'components/dynamic';

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
  | { key: 'code'; filepath: Lookup.CodeFilepathKey }
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
      children: [
        {
          type: 'tabset',
          weight: 50,
          selected: 0,
          children: tabs.map((meta) => ({
            type: 'tab',
            name: meta.key === 'code'
              ? meta.filepath
              : `${meta.filepath.slice(0, -4)}`, // sans .jsx
            config: {
              key: meta.key,
            },
            component: meta.filepath,
            enableClose: false,
          })),
        }
      ],
    }
  };
}

function factory(node: TabNode) {
  const { key: nodeKey } = node.getConfig() as { key: TabMeta['key'] };

  switch (nodeKey) {
    case 'code': {
      const filepath = node.getComponent() || '';
      if (filepath in Lookup.code) {
        return <Tab>
          <CodeEditor
              height="100%"
              padding="16px 0"
              lineNumbers
              readOnly
              code={Lookup.code[filepath as Lookup.CodeFilepathKey]}
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
      <div>{children}</div>
    </TabRoot>
  );
}

const TabRoot = styled('section')`
  display: flex;
  flex-direction: column;
  height: 100%;
  div:nth-of-type(2) { flex-grow: 1; }
`;

function TabToolbar() {
  return (
    <div css={css`
      background: #444;
      color: white;
      padding: 6px 8px;
    `}>
      toolbar goes here
    </div>
  );
}