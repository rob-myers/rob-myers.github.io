import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useCallback } from "react";
import useCode, { CodeMeta } from "store/code.store";

export default function CodeToolbar({ code }: Props) {
  const reset = useCallback(() => {
    if (code) {
      useCode.api.updateCode(code.key, ({ original }) => ({ current: original }));
      useCode.api.persist(code.key);
    }
  }, [code]);

  const toggleLazy = useCallback(() => {
    if (code) {
      useCode.api.updateCode(code.key, ({ lazy }) => ({ lazy: !lazy }));
      useCode.api.persist(code.key);
    }
  }, [code]);

  return (
    <Root>
      <div>{code?.key}</div>
      <RightToolbar>
        <LazyloadButton
          greyed={code?.lazy??true}
          title="lazy load?"
          onClick={toggleLazy}
        >
          lazy
        </LazyloadButton>
        <ResetButton onClick={reset}>
          reset
        </ResetButton>
      </RightToolbar>
    </Root>
  );
}

interface Props {
  code: CodeMeta | null;
}

const Root = styled.section`
  font-size: 10pt;
  background: #222;
  color: #fff;
  height: 28px;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(100, 100, 100, 0.5);
`;

const RightToolbar = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
`;

const ResetButton = styled.div<{}>`
  outline: none;
  cursor: pointer;
  color: #ddd;
`;

const LazyloadButton = styled.div<{ greyed: boolean }>`
  outline: none;
  cursor: pointer;
  ${({ greyed = false }) => greyed
    && css`color: #777;`
    || css`color: #ddd;`}
`;