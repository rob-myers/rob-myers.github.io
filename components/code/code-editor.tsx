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
  console.log('process context', ctxt);
}

async function readIntoVar({ args, var, api }) {
  if (args[0]) {
    var[args[0]] = await api.read();
  }
}

function *testYield(pr) {
  yield* ['process context:', pr];
}

async function *testYieldRead({ api }) {
  const value = await api.read();
  yield 'the following was read:';
  yield value;
}

class Util {
  static sum(a, b) {
    return a + b;
  }
}
 
`.trimLeft());
  return (
    <Root>
      <Toolbar>
        Toolbar
      </Toolbar>
      <EditorContainer>
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
      </EditorContainer>
    </Root>
  );
}

const Root = styled.section`
  grid-area: code;
  flex: 1;
`;

const Toolbar = styled.section`
  font-size: 11pt;
  background: #445;
  color: #ccc;
  height: 28px;
  padding: 6px;
`;

const EditorContainer = styled.div`
  height: calc(100% - 28px);
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
