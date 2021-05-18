import React from "react";
import styled from "@emotion/styled";
import ReactSimpleCodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

const CodeEditor: React.FC = () => {
  const [code, setCode] = React.useState(`
function testLog(ctxt) {
  console.log('process ctxt', ctxt);
}

async function readIntoVar(ctxt) {
  const [varName] = ctxt.args;
  if (varName) {
    ctxt[varName] = await ctxt.api.read();
  }
}

function *testYield(ctxt) {
  yield* ['process ctxt', ctxt];
}

async function *yieldRead(ctxt) {
  const value = await ctxt.api.read();
  yield 'the following was read:';
  yield value;
}

//#region pure
function sum(a, b) {
  return a + b;
}
//#endregion
  
`.trimLeft());
  return (
    <Root>
      <Editor
        value={code}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => highlight(code, languages.javascript, 'javascript')}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          // prism-tomorrow specific:
          background:'#2d2d2d',
          color: '#ccc',
        }}
      />
    </Root>
  );
}

const Root = styled.div`
  grid-area: code;
  background: #000;
  flex: 1;
  overflow: auto;
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

export default CodeEditor;
