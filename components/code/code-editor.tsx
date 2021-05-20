import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import ReactSimpleCodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

import useCodeStore from "store/code.store";
import CodeToolbar from "./code-toolbar";
import { CodeError, codeService } from "model/code/code.service";
import useSessionStore from "store/session.store";

export default function CodeEditor({ codeKey }: Props) {
  const code = useCodeStore(({ code }) => codeKey in code ? code[codeKey] : null);
  const sessionKey = useSessionStore(({ session }) => session[codeKey.split('@')[1]]?.key);
  const [codeError, setCodeError] = useState<CodeError>();
  const timeoutId = useRef(0);

  const onValueChange = useCallback((latest: string) => {
    useCodeStore.api.updateCode(codeKey, { current: latest });
    window.clearTimeout(timeoutId.current);

    timeoutId.current = window.setTimeout(()=> {
      const result = codeService.parseJs(latest);
      if ('error' in result) {
        setCodeError(result);
      } else {// TODO send result to session
        console.info(result.output);
        sessionKey && codeService.jsToSession(sessionKey, result);
        setCodeError(undefined);
      }
      useCodeStore.api.persist(codeKey); // Even if error
    }, 1000);
  }, [codeKey, sessionKey]);

  useEffect(() => {// Initial parse
    code?.key && sessionKey && onValueChange(code.current);
  }, [code?.key, sessionKey]);

  const hightlightWithLineNumbers = useCallback((code: string) =>
    highlight(code, languages.javascript, 'javascript')
      .split("\n")
      .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
      .join("\n"),
    []);

  return (
    <Root>
      <CodeToolbar
        code={code}
        error={codeError}
      />
      <EditorContainer>
        <Gap/>
        {code &&  (
          <Editor
            value={code.current}
            onValueChange={onValueChange}
            highlight={hightlightWithLineNumbers}
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
}

function Gap() {
  return (
    <div style={{ display: 'flex', height: 8 }}>
      <div style={{ width: 32, background: '#222' }} />
    </div>
  );
}

const Root = styled.section`
  grid-area: code;
  flex: 1;
  position: relative;
`;

const EditorContainer = styled.div`
  height: calc(100% - 28px);
  overflow: auto;
  color: #ffc;
  background: #333;
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
    padding-left: 40px !important;
  }

  .editorLineNumber {
    position: absolute;
    left: 0px;
    text-align: right;
    width: 32px;
    font-weight: 100;
    background: #222;
    color: #aaa;
    padding-right: 4px;
  }
`;
