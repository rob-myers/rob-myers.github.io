import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import { CodeEditor } from 'components/dynamic';
import PanZoom from 'runtime/components/PanZoom';
import 'flexlayout-react/style/dark.css';
import { css } from '@emotion/react';

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
            "name": "code",
            "component": "code", // TODO need filename too
          }
        ]
      },
      {
        "type": "tabset",
        "weight": 50,

        "selected": 0,
        "children": [
          {
            "type": "tab",
            "name": "Two",
            "component": "does_not_exist"
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
        code={`
function MyComponent(props) {
  return <>
    <label for={props.name}>{props.label}</label>
    <input name={props.name} placeholder={props.hint} />
  </>;
}

import { h, Fragment } from 'preact';

function MyComponentWithoutJSX(props) {
  return h(Fragment, null,
    h("label", { for: props.name }, props.label),
    h("input", { name: props.name, placeholder: props.hint })
  );
}
        `} />
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
      border: 1px solid #ddd;
    `} >
      <Layout
        model={model}
        factory={factory}
      />
    </div>
  );
}
