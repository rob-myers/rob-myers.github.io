import { useCallback, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { debounceTime, tap } from "rxjs/operators";
import styled from "@emotion/styled";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
// import "ace-builds/src-noconflict/theme-monokai";
// import "ace-builds/src-noconflict/theme-tomorrow_night_bright";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";

import { CodeError } from "model/code/code.service";
import useCodeStore from "store/code.store";
import CodeToolbar from "./CodeToolbar";

export default function CodeEdit({ codeKey }: { codeKey: string }) {
  const subj = useRef(new Subject<string>());
  const ace = useRef<AceEditor>(null);
  const code = useCodeStore(({ code }) => codeKey in code ? code[codeKey] : null);
  const [codeError, setCodeError] = useState<CodeError>();

  useEffect(() => {
    const sub$ = subj.current.pipe(
      debounceTime(300),
      tap(latest => useCodeStore.api.updateCode(codeKey, { current: latest })),
    ).subscribe();
    return () => void sub$.unsubscribe();
  }, []);
  
  useEffect(() => {
    const editor = ace.current?.editor
    if (code && editor) {
      editor.setValue(code.current);
      editor.clearSelection();
      editor.setShowPrintMargin(false);
    }
  }, [code?.updateEditorAt]);

  const onChange = useCallback((value: string) => {
    subj.current.next(value)
  }, []);


  return (
    <Root>
      <CodeToolbar
        code={code}
        error={codeError}
      />
      <AceEditor
        ref={ace}
        mode="javascript"
        // theme="tomorrow_night"
        onChange={onChange}
        enableLiveAutocompletion
        // editorProps={{}}
        width="100%"
        height="calc(100% - 28px)"
      />
    </Root>
  );
}

const Root = styled.section`
  grid-area: code;
`;
