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
        value: (code || '').trim(),
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
        readOnly: readOnly
          // prevent text-edit UI on mobile device
          ? window.matchMedia('(max-width: 400px)').matches ? 'nocursor' : true
          : false,

        ...lineNumbers && {
          foldOptions: {
            rangeFinder: CodeMirror.fold.indent,
          },
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        },
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
      ref={editorRoot}
      height={height}
      padding={lineNumbers ? 12 : 24}
    />
  );
}

export interface Props {
  code: string;
  gridArea?: string;
  lineNumbers?: boolean;
  readOnly?: boolean;
  height: string;
  folds?: CodeMirror.Position[];
}

const Root = styled('div', React.forwardRef)<{
  height?: string;
  padding: number;
}>`
  width: 100%;
  height: 100%;
  font-size: 0.9rem;
  @media(max-width: 600px) {
    font-size: 0.8rem;
  }

  .CodeMirror {
    ::selection {
      background: rgb(40, 73, 105);
    }

    height: ${props => props.height || ''};
    .CodeMirror-lines {
      margin: ${props => props.padding}px 0;
    }
    .CodeMirror-line {
      padding: 0 ${props => props.padding}px;
    }
    .CodeMirror-scrollbar-filler {
      background: none;
    }
  }
`;
