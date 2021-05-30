import dynamic from 'next/dynamic';

export const TextEditor = dynamic(
  () => import('./code/text-editor'),
  { ssr: false },
);
