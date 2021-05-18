import React from "react";
import styled from "@emotion/styled";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

const CodeEditor: React.FC = () => {
  const [code, setCode] = React.useState(`
function test(ctxt) {
  console.log('process ctxt', ctxt);
}
`.trim());
  return (
    <Root
      value={code}
      onValueChange={(code) => setCode(code)}
      highlight={(code) => highlight(code, languages.javascript, 'javascript')}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
        // TODO remove hard-coding
        minHeight: 400,
        // prism-tomorrow specific:
        background:'#2d2d2d',
        color: '#ccc',
      }}
    />
  );
}

const Root = styled(Editor)`
  grid-area: code;
  background: #000;
  overflow: scroll;
`;

export default CodeEditor;
