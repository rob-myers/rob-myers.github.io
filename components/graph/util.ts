import type { Props } from './cytoscape'

export const defaults: Pick<
  Props,
  'elements' | 'stylesheet' | 'zoom' | 'pan'
> = {
  elements: [
    { data: { id: 'a', label: 'Example node A' } },
    { data: { id: 'b', label: 'Example node B' } },
    { data: { id: 'e', source: 'a', target: 'b' } }
  ],
  stylesheet: [
    {
      selector: 'node',
      style: {
        label: 'data(label)'
      },
    }
  ],
  zoom: 1,
  pan: { x: 0, y: 0 },
};

const style: cytoscape.Stylesheet = {
    selector: 'node',
    style: {
      width: 10,
      height: 10,
      backgroundColor: '#000',
    },
};

export const demoElements: Props['elements'] = [
  { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
  { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
  { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
];

export const demoStylesheet: Props['stylesheet'] = [
  {
    selector: 'node',
    style: {
      width: 10,
      height: 10,
      backgroundColor: '#000',
      label: 'data(label)',
      "font-size": 10,
    },
  }
];
