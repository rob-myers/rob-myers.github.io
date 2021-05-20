import React, { useRef } from "react";
import styled from "@emotion/styled";
import ReactSimpleCodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

import useCode from "store/code.store";
import CodeToolbar from "./code-toolbar";

export default function CodeEditor({ codeKey, sessionKey }: Props) {
  const code = useCode(({ code }) => codeKey in code ? code[codeKey] : null);
  const timeoutId = useRef(0);

  return (
    <Root>
      <CodeToolbar code={code} />
      <EditorContainer>
        {code &&  (
          <Editor
            value={code.current}
            onValueChange={(latest) => {
              useCode.api.updateCode(codeKey, { current: latest });
              window.clearTimeout(timeoutId.current);
              timeoutId.current = window.setTimeout(()=> useCode.api.persist(codeKey), 2000);
            }}
            highlight={(code) => highlight(code, languages.javascript, 'javascript')}
            padding={12}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
            }}
          />
        )}
      </EditorContainer>
    </Root>
  );
}

interface Props {
  codeKey: string;
  sessionKey: string;
}


const Root = styled.section`
  grid-area: code;
  flex: 1;
`;

const EditorContainer = styled.div`
  height: calc(100% - 28px);
  overflow: auto;
  background: #333;
  color: #ffc;
`;

const Editor = styled(ReactSimpleCodeEditor)`
  white-space: pre;
  caret-color: #fff;
  min-width: 100%;
  min-height: 100%;
  float: left;
  & > textarea,
  & > pre {
    outline: none;
    white-space: pre !important;
  }
`;
