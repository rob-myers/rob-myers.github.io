import dynamic from 'next/dynamic';
import _CodeEditor from './code/CodeEditor';
import _XTerm from './sh/XTerm';

export const CodeEditor = dynamic(
  () => import('./code/CodeEditor'),
  { ssr: false },
) as typeof _CodeEditor;

export const XTerm = dynamic(
  () => import('./sh/XTerm'),
  { ssr: false },
) as typeof _XTerm;
