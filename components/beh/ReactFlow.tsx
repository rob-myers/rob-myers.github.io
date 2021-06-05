import { deepClone } from 'model/generic.model';
import { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  updateEdge,
  Connection,
  Edge,
  Elements,
  removeElements,
  OnLoadParams,
  Controls,
  Position,
} from 'react-flow-renderer';
import CustomEdge from './CustomEdge';

export default function ReactFlowExample() {
  const [elements, setElements] = useState<Elements>([]);
  const [instance, setInstance] = useState<OnLoadParams>();

  const on = useMemo(() => ({
    elementsRemove: (elsToRemove: Elements) =>
      setElements((els) => removeElements(elsToRemove, els)),
    edgeUpdate: (oldEdge: Edge, newConnection: Connection) =>
      setElements((els) => updateEdge(oldEdge, newConnection, els)),
    connect: (params: Edge | Connection) =>
      setElements((els) => addEdge({ ...params }, els)),
    load: (params: OnLoadParams) =>
      setInstance(params),
  }), []);

  useEffect(() => {
    setElements(deepClone(initElements));
  }, []);

  useEffect(() => {
    if (instance) {
      const onResize = () => instance.fitView();
      window.addEventListener('resize', onResize);
      onResize();
      return () => window.removeEventListener('resize', onResize);
    }
  }, [instance]);

  return (
    <ReactFlow
      elements={elements}
      onConnect={on.connect}
      onElementsRemove={on.elementsRemove}
      onEdgeUpdate={on.edgeUpdate}
      zoomOnPinch
      panOnScroll
      onLoad={on.load}
      edgeTypes={{
        custom: CustomEdge,
      }}
    >
       <Controls />
    </ReactFlow>
  )
}


const initElements: Elements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'root' },
    position: { x: 250, y: 5 },
    sourcePosition: Position.Bottom,
  },
  { id: '2', data: { label: '1' }, position: { x: 100, y: 100 }, style: { width: 30 } },
  { id: '3', data: { label: '2' }, position: { x: 250, y: 150 } },
  { id: '4', data: { label: '3' }, position: { x: 500, y: 200 } },
  { id: 'e1-2', source: '1', target: '2', type: 'custom', data: { text: '▶️' } },
  { id: 'e1-3', source: '1', target: '3', type: 'custom', data: { text: '▶️' } },
  { id: 'e1-4', source: '1', target: '4', type: 'custom', data: { text: '▶️' } },
];
