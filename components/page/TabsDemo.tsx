import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import { CodeEditor } from 'components/dynamic';
import PanZoom from 'runtime/components/PanZoom';
import 'flexlayout-react/style/dark.css';
import { css } from '@emotion/react';
import { initialCode } from 'model/code/code';

const json : IJsonModel= {
  global: {},
  layout: {
    "type": "row",
    "weight": 100,
    "children": [
      {
        "type": "tabset",
        "weight": 50,
        "selected": 0,
        "children": [
          {
            "type": "tab",
            "name": "pan-zoom",
            "component": "panzoom",
          },
          {
            "type": "tab",
            "name": "code",
            "component": "code", // TODO need filename too
          }
        ]
      }
    ]
  }
};

const model = Model.fromJson(json);

const factory = (node: TabNode) => {
  var component = node.getComponent();
  if (component === "code") {
    return (
      <CodeEditor
        height="100%"
        padding="16px 0"
        lineNumbers
        readOnly
        code={initialCode['PanZoom.jsx']} />
    );
  } else {
    return (
      <PanZoom>
        <rect x={10} y={10} width={20} height={20} fill="red" />
      </PanZoom>
    )
  }
}

export function TabsDemo() {
  return (
    <div css={css`
      position: relative;
      width: 100%;
      height: 300px;
      border: 1px solid #555;
    `} >
      <Layout
        model={model}
        factory={factory}
      />
    </div>
  );
}
