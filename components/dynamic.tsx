import dynamic from 'next/dynamic';
import _CodeEditor from './code/CodeEditor';
import _XTerm from './sh/XTerm';
import _Loadable from './page/Loadable';

export const CodeEditor = dynamic(
  () => import('./code/CodeEditor'),
  { ssr: false },
) as typeof _CodeEditor;

export const XTerm = dynamic(
  () => import('./sh/XTerm'),
  { ssr: false },
) as typeof _XTerm;

export const Loadable = dynamic(
  () => import('./page/Loadable'),
  { ssr: false },
) as typeof _Loadable;
