import dynamic from 'next/dynamic';

export const CodeEdit = dynamic(
  () => import('./code/CodeEdit'),
  { ssr: false },
);

export const CodeEditor = dynamic(
  () => import('./code/CodeEditor'),
  { ssr: false },
);
  
import type XTermComponent from './sh/XTerm';

export const XTerm = dynamic(() =>
  import('./sh/XTerm'), { ssr: false },
) as typeof XTermComponent;
