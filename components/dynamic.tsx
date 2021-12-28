import dynamic from 'next/dynamic';
import type _Layout from './page/Layout';
import type _CodeEditor from './code/CodeEditor';
import type _Terminal from './sh/Terminal';
import type _XTerm from './sh/XTerm';

export const CodeEditor = dynamic(
  () => import('./code/CodeEditor'),
  { ssr: false },
) as typeof _CodeEditor;

export const Terminal = dynamic(
  () => import('./sh/Terminal'),
  { ssr: false },
) as typeof _Terminal;

export const XTerm = dynamic(
  () => import('./sh/XTerm'),
  { ssr: false },
) as typeof _XTerm;

export const Layout = dynamic(
  () => import('./page/Layout'),
  { ssr: false },
) as typeof _Layout;
