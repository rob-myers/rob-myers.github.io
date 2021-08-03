import { useEffect, useMemo, useRef } from "react";
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
import CodeMirror from "codemirror";

// TODO move elsewhere
// import CodeToolbar from "./CodeToolbar";

export default function CodeEditor({
  code, // TODO use store
  gridArea,
  lineNumbers,
  padding,
  height,
  readOnly,
}: Props) {
  const editorRoot = useRef<HTMLDivElement>(null);
  const cm = useRef<CodeMirror.Editor>();
  const value = useMemo(() => (code || '').trim(), [code]);

  useEffect(() => {
    if (editorRoot.current) {
      cm.current = codemirror(editorRoot.current, {
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
      cm.current = undefined;
    };
  }, []);

  useEffect(() => cm.current?.setValue(value || '') ,[value]);

  return (
    <Root
      gridArea={gridArea}
      height={height}
      padding={padding}
      ref={editorRoot}
    />
  );
}

interface Props {
  code?: string;
  gridArea?: string;
  lineNumbers?: boolean;
  padding?: string;
  readOnly?: boolean;
  height: string;
}

const Root = styled.div<{
  gridArea?: string;
  height?: string;
  padding?: string;
}>`
  grid-area: ${props => props.gridArea || ''};
  width: 100%;
  height: 100%;
  font-size: 13px;
  
  .CodeMirror {
    height: ${props => props.height || ''};
    .CodeMirror-lines {
      padding: ${props => props.padding};
    }
  }
`;
