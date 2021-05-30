import dynamic from 'next/dynamic';

export const CodeEditor = dynamic(
  () => import('./code/code-editor'),
  { ssr: false },
);
