import dynamic from 'next/dynamic';
import { styled } from 'goober';
import type { Props } from './CodeEditor';

export default function WrappedCodeEditor(props: Props) {
  return (
    <Background height={props.height}>
      <CodeEditor {...props} />
    </Background>
  );
}

const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false });

const Background = styled('section')<{ height: string }>`
  height: ${props => props.height || '100%'};
  background: #000000;
`;
