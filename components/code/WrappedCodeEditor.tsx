import { styled } from 'goober';
import { CodeEditor } from 'components/dynamic';
import type { Props } from './CodeEditor';

export default function WrappedCodeEditor(props: Props & { margin?: string }) {
  return (
    <Background height={props.height} margin={props.margin}>
      <CodeEditor {...props} />
    </Background>
  );
}

const Background = styled('section')<{ height: string; margin?: string; }>`
  height: ${props => props.height || '100%'};
  background: #000000;
  margin: ${props => props.margin || 'auto'};
`;
