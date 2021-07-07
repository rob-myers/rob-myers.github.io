import { useRef } from "react";
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript';
import styled from "@emotion/styled";

import useCodeStore from "store/code.store";
import CodeToolbar from "./CodeToolbar";

export default function CodeEditor({ codeKey, gridArea }: Props) {
  const code = useCodeStore(({ code }) => codeKey in code ? code[codeKey] : null);
  const cm = useRef<CodeMirror>(null);

  return (
    <Root gridArea={gridArea}>
      <CodeToolbar
        code={code}
      />

    <CodeMirror
      ref={cm}
      value={code?.current}
      options={{
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
      }}
      onChange={(editor, data, value) => {
        // TODO
      }}
    />
 
    </Root>
  );
}

interface Props {
  codeKey: string;
  gridArea?: string;
}

const Root = styled.section<{ gridArea?: string }>`
  grid-area: ${props => props.gridArea || ''};
  width: 100%;
  height: 100%;
  font-size: 10pt;
`;
