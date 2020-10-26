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
  { data: { id: '1', label: '1' }, position: { x: 0, y: 0 } },
  { data: { id: '2', label: '2' , width: 10, height: 10 }, position: { x: 100, y: 0 } },
  { data: { id: '3', label: '3' } },
  { data: { id: '4', label: '4' } },
  { data: { source: '1', target: '2', label: 'from 1 to 2',  } },
  { data: { source: '1', target: '3' }},
  { data: { source: '3', target: '4' }},
  { data: { source: '2', target: '4' }},
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
  },
  {
    selector: 'edge',
    style: {
      label: 'data(label)',
      "font-size": 10,
    },
  },
];
