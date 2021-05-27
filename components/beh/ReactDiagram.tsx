import { LegacyRef, useEffect, useRef, useState } from "react";
import { AbstractReactFactory, GenerateWidgetEvent, CanvasEngineOptions, SelectionBoxLayerFactory, CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramModel, DiagramEngine, NodeModel, PortWidget, NodeLayerFactory, LinkLayerFactory, DefaultDiagramState } from '@projectstorm/react-diagrams-core';
import { DefaultPortModel, DefaultLabelFactory, DefaultLinkFactory, DefaultNodeFactory, DefaultLinkModel, DefaultPortFactory } from '@projectstorm/react-diagrams-defaults';

export default function ReactDiagram() {
  const [engine, setEngine] = useState<DiagramEngine>();
  
  useEffect(() => {
    if (engine) return;

    const e = createEngine({});
    e.getNodeFactories().registerFactory(new CustomNodeFactory);
    // console.log({ engine });
    
    const node1 = new CustomNodeModel({ color: 'rgb(192,255,0)' });
    node1.setPosition(50, 50);
    const node2 = new CustomNodeModel({ color: 'rgb(0,192,255)' });
    node2.setPosition(200, 50);
    const link1 = new DefaultLinkModel;
    link1.setSourcePort(node1.getPort('out')!)
    link1.setTargetPort(node2.getPort('in')!)

    const model = new DiagramModel;
    model.addAll(node1, node2, link1);
    e.setModel(model);
    setEngine(e);
  }, []);

  return engine
    ? <CanvasWidget className="diagram-container" engine={engine} />
    : null;
}

function createEngine(options: CanvasEngineOptions = {}): DiagramEngine {
  const engine = new DiagramEngine(options);
  // register model factories
  engine.getLayerFactories().registerFactory(new NodeLayerFactory() as any);
  engine.getLayerFactories().registerFactory(new LinkLayerFactory() as any);
  engine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory());

  engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
  engine.getNodeFactories().registerFactory(new DefaultNodeFactory()); // i cant figure out why
  engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
  // engine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
  engine.getPortFactories().registerFactory(new DefaultPortFactory());

  // register the default interaction behaviours
  engine.getStateMachine().pushState(new DefaultDiagramState());
  return engine;
};

class CustomNodeFactory extends AbstractReactFactory<CustomNodeModel, DiagramEngine> {
  constructor() {
    super('custom-node');
  }

  generateModel() {
    return new CustomNodeModel({});
  }

  generateReactWidget(event: GenerateWidgetEvent<CustomNodeModel>) {
    return <CustomNodeWidget engine={this.engine} node={event.model} />;
  }
}

class CustomNodeModel extends NodeModel {
  color: string;

  constructor(opts: { color?: string }) {
    super({ ...opts, type: 'custom-node' });
    this.color = opts.color || 'red';

    this.addPort(new DefaultPortModel({ in: true, name: 'in' }));
    this.addPort(new DefaultPortModel({ in: false, name: 'out' }));
  }

  serialize() {
    return { ...super.serialize(), color: this.color };
  }

  deserialize(event: any): void {
    super.deserialize(event);
    this.color = event.data.color;
  }
}

function CustomNodeWidget(props: {
  engine: DiagramEngine;
  node: CustomNodeModel;
}) {
  return (
    <div className="custom-node">
      <PortWidget engine={props.engine} port={props.node.getPort('in')!}>
        <div className="circle-port" />
      </PortWidget>
      <PortWidget engine={props.engine} port={props.node.getPort('out')!}>
        <div className="circle-port" />
      </PortWidget>
      <div className="custom-node-color" style={{ backgroundColor: props.node.color }} />
    </div>
  );
}
