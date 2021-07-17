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

// TODO move elsewhere
// import CodeToolbar from "./CodeToolbar";

export default function CodeEditor({
  code, // TODO use store
  gridArea,
  lineNumbers,
  pad,
  readOnly,
}: Props) {
  const editorRoot = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (editorRoot.current) {
      const cm = codemirror(editorRoot.current, {
        autoCloseBrackets: true,
        keyMap: 'sublime',
        theme: 'vscode-dark',
        lineNumbers,
        matchBrackets: true,
        // mode: 'jsx',
        mode: 'jsx-styled',
        tabSize: 2,
        value: code?.trim() || '',
        extraKeys: {
          "Cmd-Ctrl-Up": "noOp",
          "Cmd-Ctrl-Down": "noOp",
          "Ctrl-Alt-Up": "swapLineUp",
          "Ctrl-Alt-Down": "swapLineDown",
          "Cmd-/": "customToggleComment",
        },
        addModeClass: true,
        readOnly,
      });
    }
    return () => {
      editorRoot.current?.childNodes.forEach(x => x.remove());
    };
  }, []);

  return (
    <Root gridArea={gridArea} pad={pad}>
      <div className="editor-root" ref={editorRoot} />
    </Root>
  );
}

interface Props {
  code?: string;
  gridArea?: string;
  lineNumbers?: boolean;
  pad?: boolean;
  readOnly?: boolean;
}

const Root = styled.section<{ gridArea?: string; pad?: boolean }>`
  grid-area: ${props => props.gridArea || ''};
  width: 100%;
  height: 100%;
  font-size: 10pt;
  
  >.editor-root {
    height: 100%;
    .CodeMirror {
      height: 100%;
    }
  }

  .CodeMirror-scroll {
    padding: ${props => props.pad ? '12px' : ''};
  }
`;
