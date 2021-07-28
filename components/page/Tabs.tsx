import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
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
            "name": "One",
            "component": "button"
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

            "component": "button"
          }
        ]
      }
    ]
  }
};

const model = Model.fromJson(json);

const factory = (node: TabNode) => {
  var component = node.getComponent();
  if (component === "button") {
    return <button>{node.getName()}</button>;
  }
}

export function TabsDemo() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 400 }}>
      <Layout
        model={model}
        factory={factory}
      />
    </div>
  );
}
