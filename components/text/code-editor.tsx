import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
// import "prismjs/themes/prism.css"; //Example style, you can use another
import "prismjs/themes/prism-tomorrow.css";

const CodeEditor: React.FC = () => {
  const [code, setCode] = React.useState(
    `function add(a, b) {\n  return a + b;\n}`
  );
  return (
    <Editor
      value={code}
      onValueChange={(code) => setCode(code)}
      highlight={(code) => highlight(code, languages.javascript, 'javascript')}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
        height: 'inherit',
        // prism-tomorrow specific:
        background:'#2d2d2d',
        color: '#ccc',
      }}
    />
  );
}

export default CodeEditor;