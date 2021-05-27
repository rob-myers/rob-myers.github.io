import dynamic from 'next/dynamic'; 

export const ReactDiagram = dynamic(
  () => import('components/beh/ReactDiagram'),
  { ssr: false },
);
