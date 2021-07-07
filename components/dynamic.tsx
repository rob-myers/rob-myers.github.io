import dynamic from 'next/dynamic';

export const CodeEditor = dynamic(
  () => import('./code/CodeEditor'),
  { ssr: false },
);
  
import type XTermComponent from './sh/XTerm';

export const XTerm = dynamic(() =>
  import('./sh/XTerm'), { ssr: false },
) as typeof XTermComponent;
