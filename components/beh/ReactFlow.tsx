import { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Elements,
  removeElements,
  ArrowHeadType,
  OnLoadParams,
  Controls,
  MiniMap,
} from 'react-flow-renderer';
import CustomEdge from './CustomEdge';

export default function ReactFlowExample() {
  const [elements, setElements] = useState(initElements);
  const [instance, setInstance] = useState<OnLoadParams>();

  const on = useMemo(() => ({
    elementsRemove: (elsToRemove: Elements) =>
      setElements((els) => removeElements(elsToRemove, els)),
    connect: (params: Edge | Connection) =>
      setElements((els) => addEdge({ ...params, type: 'smoothstep' }, els)),
    load: (params: OnLoadParams) =>
      setInstance(params),
  }), []);

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
      zoomOnPinch
      panOnScroll
      onLoad={on.load}
      edgeTypes={{
        custom: CustomEdge
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
  },
  { id: '2', data: { label: '1' }, position: { x: 100, y: 100 }, style: { width: 30 } },
  { id: '3', data: { label: '2' }, position: { x: 250, y: 150 } },
  { id: '4', data: { label: '3' }, position: { x: 500, y: 200 } },
  { id: 'e1-2', label: '◆', labelBgStyle: { opacity: 0 }, source: '1', target: '2', type: 'custom',  data: { text: '→' } },
  { id: 'e1-3', source: '1', target: '3', },
  { id: 'e1-4', source: '1', target: '4', type: 'custom',  data: { text: '→' } },
];
