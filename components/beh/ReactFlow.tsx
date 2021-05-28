import ReactFlow, { Elements } from 'react-flow-renderer';

export default function ReactFlowExample() {
  return <ReactFlow elements={elements} />
}

const elements: Elements = [
  // { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  // { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  // { id: 'e1-2', source: '1', target: '2', animated: true },
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 5, y: 5 },
  },
  { id: '2', data: { label: 'straight' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'default' }, position: { x: 250, y: 150 } },
  { id: '4', data: { label: 'step' }, position: { x: 500, y: 200 } },
  { id: '5', data: { label: 'smoothstep' }, position: { x: 500, y: 200 } },
  { id: 'e1-2', source: '1', target: '2', type: 'straight' },
  { id: 'e1-3', source: '1', target: '3', type: 'default' },
  { id: 'e1-4', source: '1', target: '4', type: 'step' },
  { id: 'e1-5', source: '1', target: '5', type: 'smoothstep' },
];
