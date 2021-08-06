import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import { CodeEditor } from 'components/dynamic';
import PanZoomDemo from 'projects/panzoom/Demo';
import 'flexlayout-react/style/dark.css';
import { css } from '@emotion/react';
import { initialCode } from 'model/code/code';

const json : IJsonModel= {
  global: {
    tabEnableRename: false,
  },
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
            enableClose: false,
          },
          {
            "type": "tab",
            "name": "code",
            "component": "code", // TODO need filename too
            enableClose: false,
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
      <PanZoomDemo />
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

      .flexlayout__tab_button_content {
        user-select: none;
        font-size: smaller;
      }
      .flexlayout__tab {
        background: white;
        color: black;
      }
    `} >
      <Layout
        model={model}
        factory={factory}
      />
    </div>
  );
}
