import { useEffect, useRef } from "react";
import styled from "@emotion/styled";

import codemirror from 'codemirror';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
// import 'codemirror/addon/fold/foldcode';
// import 'codemirror/addon/comment/comment';

import 'codemirror/mode/sass/sass';
import 'codemirror/mode/javascript/javascript';
import './codemirror/jsx-styled-mode';
import './codemirror/custom-cmds';

import useCodeStore from "store/code.store";
import CodeToolbar from "./CodeToolbar";


export default function CodeEditor({ codeKey, gridArea }: Props) {
  const editorRoot = useRef<HTMLDivElement>(null);
  const code = useCodeStore(({ code }) => codeKey in code ? code[codeKey] : null);
  
  useEffect(() => {
    if (editorRoot.current) {
      const cm = codemirror(editorRoot.current, {
        autoCloseBrackets: true,
        keyMap: 'sublime',
        theme: 'vscode-dark',
        lineNumbers: true,
        matchBrackets: true,
        // mode: 'jsx',
        mode: 'jsx-styled',
        tabSize: 2,
        value: code?.current || '',
        extraKeys: {
          "Cmd-Ctrl-Up": "noOp",
          "Cmd-Ctrl-Down": "noOp",
          "Ctrl-Alt-Up": "swapLineUp",
          "Ctrl-Alt-Down": "swapLineDown",
          "Cmd-/": "customToggleComment",
        },
        addModeClass: true,
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
