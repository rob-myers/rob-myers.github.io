import { useCallback, useState } from 'react';
import ReactFlow, { addEdge, Connection, Edge, Elements, removeElements, ArrowHeadType } from 'react-flow-renderer';

export default function ReactFlowExample() {
  const [elements, setElements] = useState(initElements);

  const onElementsRemove = useCallback((elToRemove: Elements) =>
    setElements((els) => removeElements(elToRemove, els)), []);
  const onConnect = useCallback((params: Edge | Connection) =>
    setElements((els) => addEdge(params, els)), []);

  return (
    <ReactFlow
      elements={elements}
      onConnect={onConnect}
      onElementsRemove={onElementsRemove}
      zoomOnPinch
      panOnScroll
    />
  )
}

const initElements: Elements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'root' },
    position: { x: 5, y: 5 },
  },
  { id: '2', data: { label: '1' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: '2' }, position: { x: 250, y: 150 } },
  { id: '4', data: { label: '3' }, position: { x: 500, y: 200 } },
  { id: 'e1-2', label: '◆', labelBgStyle: { opacity: 0 }, source: '1', target: '2', type: 'smoothstep', arrowHeadType: ArrowHeadType.ArrowClosed },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
];
