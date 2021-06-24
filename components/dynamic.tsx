import dynamic from 'next/dynamic';

export const CodeEdit = dynamic(
  () => import('./code/CodeEdit'),
  { ssr: false },
  );
  
import type XTermComponent from './sh/XTerm';

export const XTerm = dynamic(() =>
  import('./sh/XTerm'), { ssr: false },
) as typeof XTermComponent;
