import dynamic from 'next/dynamic';

export const CodeEdit = dynamic(
  () => import('./code/CodeEdit'),
  { ssr: false },
);
