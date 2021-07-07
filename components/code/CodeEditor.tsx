import { useEffect, useRef } from "react";
import styled from "@emotion/styled";

import codemirror from 'codemirror';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/foldcode'; // TODO

import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/sass/sass';
import './codemirror/custom-jsx-mode';
import './codemirror/custom-keymap';

import useCodeStore from "store/code.store";
import CodeToolbar from "./CodeToolbar";

export default function CodeEditor({ codeKey, gridArea }: Props) {
  const editorRoot = useRef<HTMLDivElement>(null);
  const code = useCodeStore(({ code }) => codeKey in code ? code[codeKey] : null);

  useEffect(() => {
    if (editorRoot.current) {
      const cm = codemirror(editorRoot.current, {
        // mode: 'jsx',
        mode: 'jsx-styled',
        theme: 'vscode-dark',
        lineNumbers: true,
        tabSize: 2,
        value: code?.current || '',
        matchBrackets: true,
        keyMap: 'custom',
      });
    }
    return () => {
      editorRoot.current?.childNodes.forEach(x => x.remove());
    };
  }, []);

  return (
    <Root gridArea={gridArea}>
      <CodeToolbar
        code={code}
      />

      <div ref={editorRoot} />
 
    </Root>
  );
}

interface Props {
  codeKey: string;
  gridArea?: string;
}

const Root = styled.section<{ gridArea?: string }>`
  grid-area: ${props => props.gridArea || ''};
  width: 100%;
  height: 100%;
  font-size: 11pt;
`;
