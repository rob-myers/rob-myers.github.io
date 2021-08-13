import React, { useMemo } from "react";
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import styled from '@emotion/styled';

import * as Lookup from 'model/tabs-lookup';
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
    font-size: smaller;
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
              : `@${meta.filepath.slice(0, -4)}`, // sans .jsx
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
        return <CodeEditor
          height="100%"
          padding="16px 0"
          lineNumbers
          readOnly
          code={Lookup.code[filepath as Lookup.CodeFilepathKey]}
        />;
      }
      return <ErrorMessage>Unknown code with filepath {filepath}</ErrorMessage>;
    }
    case 'component': {
      const componentKey = node.getComponent() || '';
      if (componentKey in Lookup.component) {
        const FC = Lookup.component[componentKey as Lookup.ComponentFilepathKey];
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
