import React, { useMemo } from "react";
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import { styled } from "goober";

import * as Lookup from 'model/tabs/tabs-lookup';
import { CodeEditor } from 'components/dynamic';

export function Tabs({ tabs }: Props) {
  const model = useMemo(
    () => Model.fromJson(computeJsonModel(tabs)),
    [tabs],
  );

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
  | { key: 'code'; filepath: string }
  | { key: 'component'; componentKey: string }
);

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
            name: meta.key,
            component: meta.key === 'code'
              ? meta.filepath
              : meta.componentKey,
            enableClose: false,
          })),
        }
      ],
    }
  };
}

function factory(node: TabNode) {
  const nodeKey = node.getName() as TabMeta['key'];

  switch (nodeKey) {
    case 'code': {
      const filepath = node.getComponent() || '';
      if (filepath in Lookup.code) {
        return <CodeEditor
          height="100%"
          padding="16px 0"
          lineNumbers
          readOnly
          code={Lookup.code['components/PanZoom.jsx']}
        />;
      }
      return <ErrorMessage>Unknown code with filepath {filepath}</ErrorMessage>;
    }
    case 'component': {
      const componentKey = node.getComponent() || '';
      if (componentKey in Lookup.component) {
        const FC = Lookup.component[componentKey];
        return <FC/>
      }
      return <ErrorMessage>Unknown function component with name {componentKey}</ErrorMessage>;
    }
    default:
      return <ErrorMessage>Unknown TabNode with name {nodeKey}</ErrorMessage>;
  }
}

function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return <section>
    <strong>{children}</strong>
  </section>;
}

const TabsRoot = styled('div')`
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid #555;

  .flexlayout__tab_button_content {
    user-select: none;
    font-size: smaller;
  }
  .flexlayout__tab {
    background: white;
    color: black;
  }
`;
