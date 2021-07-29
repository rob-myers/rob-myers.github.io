import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import { CodeEditor } from 'components/dynamic';
import 'flexlayout-react/style/dark.css';

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
      <section style={{ padding: 8 }}>
        Unknown tab
      </section>
    )
  }
}

export function TabsDemo() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 300 }}>
      <Layout
        model={model}
        factory={factory}
      />
    </div>
  );
}
