import React, { useEffect, useRef } from "react";
import { styled } from 'goober';

import CodeMirror from 'codemirror';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/foldgutter';

import 'codemirror/mode/sass/sass';
import 'codemirror/mode/javascript/javascript';
import './codemirror/jsx-styled-mode';
import './codemirror/custom-cmds';

export default function CodeEditor({
  code,
  lineNumbers,
  padding = "12px 0",
  height,
  readOnly,
  folds,
}: Props) {
  const editorRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRoot.current) {
      const cm = CodeMirror(editorRoot.current, {
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
          "Ctrl-Q": function(cm){
            cm.foldCode(cm.getCursor());
          },
        },
        addModeClass: true,
        readOnly,
        foldOptions: {
          rangeFinder: CodeMirror.fold.indent,
        },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        // lineWrapping: true,
      });

      if (folds) {
        cm.refresh();
        folds.forEach(range => cm.foldCode(range));
      }
    }
    return () => {
      editorRoot.current?.childNodes.forEach(x => x.remove());
    };
  }, []);

  return (
    <Root
      height={height}
      padding={padding}
      ref={editorRoot}
    />
  );
}

interface Props {
  code: string;
  gridArea?: string;
  lineNumbers?: boolean;
  padding?: string;
  readOnly?: boolean;
  height: string;
  folds?: CodeMirror.Position[];
}

const Root = styled('div', React.forwardRef)<{
  height?: string;
  padding?: string;
}>`
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
