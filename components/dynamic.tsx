import dynamic from 'next/dynamic';

export const CodeEditor = dynamic(
  () => import('./code/CodeEditor'),
  { ssr: false },
);
